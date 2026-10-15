const { Bot } = require('node-telegram-bot-api');
const pool = require('../db/pool');

const AVERAGE_DARSHAN_MINUTES = 5;

let bot = null;

/**
 * Format a Date object to readable local Indian temple time (Asia/Kolkata, e.g., 11:24 PM)
 */
function formatTime(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  });
}

/**
 * Initialize Telegram Bot with polling
 */
function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.log('ℹ️  [Telegram Bot] TELEGRAM_BOT_TOKEN not provided. Bot is disabled.');
    return null;
  }

  try {
    bot = new Bot(token);

    // Global error handler
    bot.catch((err) => {
      console.warn('⚠️  [Telegram Bot] Polling/update warning:', err?.message || err);
    });

    console.log('🤖  [Telegram Bot] Service initialized in polling mode');

    // 1. /start command
    bot.command('start', async (ctx) => {
      try {
        console.log(`📩 [Telegram Bot] /start from chat ${ctx.chatId}`);
        await ctx.reply(
          'Welcome to DarshanQ. Send your devotee code (e.g. DQ-7F3K2) to check your status.'
        );
      } catch (err) {
        console.error('[Telegram Bot] /start reply error:', err.message);
      }
    });

    // 2. Devotee code matching DQ-XXXXX
    bot.hears(/DQ-[A-Z0-9]+/i, async (ctx) => {
      const match = ctx.message?.text?.match(/DQ-[A-Z0-9]+/i);
      if (!match) return;

      const devoteeCode = match[0].toUpperCase();
      const chatId = ctx.chatId;
      console.log(`📩 [Telegram Bot] Devotee code lookup '${devoteeCode}' from chat ${chatId}`);

      try {
        const result = await pool.query(
          `SELECT t.*, 
                  c.name AS checkpoint_name, 
                  c.checkpoint_type,
                  tem.name AS temple_name
           FROM queue_tokens t
           LEFT JOIN checkpoints c ON c.id = t.current_checkpoint_id
           LEFT JOIN temples tem ON tem.id = t.temple_id
           WHERE UPPER(t.devotee_code) = $1`,
          [devoteeCode]
        );

        if (result.rows.length === 0) {
          return await ctx.reply('Devotee code not found — please check and try again.');
        }

        const token = result.rows[0];

        // Ensure this chat ID is only bound to THIS latest requested token
        // (Unlink previous test/completed tokens from this chat so old tokens don't cross-alert)
        await pool.query(
          `UPDATE queue_tokens SET telegram_chat_id = NULL WHERE telegram_chat_id = $1 AND id != $2`,
          [String(chatId), token.id]
        );
        await pool.query(
          `UPDATE queue_tokens SET telegram_chat_id = $1 WHERE id = $2`,
          [String(chatId), token.id]
        );

        const now = new Date();
        const waitMinutes = Number(token.estimated_wait_minutes) || 0;
        const predictedCheckinDate = new Date(now.getTime() + waitMinutes * 60000);
        const completionDate = new Date(
          now.getTime() + (waitMinutes + AVERAGE_DARSHAN_MINUTES) * 60000
        );

        let responseText = '';

        if (token.status === 'completed') {
          const actualCheckinTime = formatTime(token.gate_checkin_time);
          responseText =
            `🛕 *DarshanQ Status Update*\n\n` +
            `• *Devotee Code:* \`${token.devotee_code}\`\n` +
            `• *Token Number:* #${token.token_number}\n` +
            `• *Gate Check-in:* ${actualCheckinTime}\n` +
            `• *Current Status:* COMPLETED ✅\n` +
            `• *Live Position:* Darshan Completed\n\n` +
            `🙏 You have safely completed holy darshan! May you be blessed.`;
        } else if (token.status === 'cancelled') {
          responseText =
            `🛕 *DarshanQ Status Update*\n\n` +
            `• *Devotee Code:* \`${token.devotee_code}\`\n` +
            `• *Token Number:* #${token.token_number}\n` +
            `• *Current Status:* CANCELLED ❌\n\n` +
            `This virtual token was cancelled.`;
        } else if (!token.gate_checkin_time) {
          // Devotee waiting to check in at the gate
          const gateName = token.checkpoint_name || 'Assigned Gate';
          responseText =
            `🛕 *DarshanQ Status Update*\n\n` +
            `• *Devotee Code:* \`${token.devotee_code}\`\n` +
            `• *Token Number:* #${token.token_number}\n` +
            `• *Assigned Gate:* ${gateName}\n` +
            `• *Predicted Gate Check-in:* ${formatTime(predictedCheckinDate)} (~${waitMinutes} min)\n` +
            `• *Estimated Darshan Completion:* ${formatTime(completionDate)}\n\n` +
            `Status: WAITING. Please reach ${gateName} when notified! Live updates enabled.`;
        } else {
          // Devotee has checked in at the gate and is moving through stations
          const actualCheckinTime = formatTime(token.gate_checkin_time);
          const currentCheckpointName = token.checkpoint_name || 'Darshan Sanctum';
          responseText =
            `🛕 *DarshanQ Status Update*\n\n` +
            `• *Devotee Code:* \`${token.devotee_code}\`\n` +
            `• *Token Number:* #${token.token_number}\n` +
            `• *Actual Gate Check-in:* ${actualCheckinTime}\n` +
            `• *Live Position:* ${currentCheckpointName}\n` +
            `• *Estimated Darshan Completion:* ${formatTime(completionDate)}\n\n` +
            `Status: CHECKED IN. Live updates enabled for this chat.`;
        }

        await ctx.reply(responseText, { parse_mode: 'Markdown' });
      } catch (err) {
        console.error('[Telegram Bot] Devotee lookup error:', err.message);
        await ctx.reply('An error occurred while looking up your code. Please try again later.');
      }
    });

    // 3. Fallback message handler for other text messages
    bot.on('message', async (ctx) => {
      const text = ctx.message?.text || '';
      if (text.startsWith('/start') || /DQ-[A-Z0-9]+/i.test(text)) {
        return;
      }
      console.log(`📩 [Telegram Bot] Unmatched message '${text}' from chat ${ctx.chatId}`);
      await ctx.reply('Devotee code not found — please check and try again.');
    });

    // Start background polling
    bot.startPolling().catch((err) => {
      console.warn('⚠️  [Telegram Bot] Polling loop error:', err.message);
    });

    return bot;
  } catch (err) {
    console.error('⚠️  [Telegram Bot] Initialization error:', err.message);
    return null;
  }
}

/**
 * Send alert message to Telegram user
 */
async function sendTelegramAlert(chatId, message) {
  if (!bot || !chatId) return;
  try {
    await bot.api.sendMessage({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    });
  } catch (err) {
    console.warn(`[Telegram Bot] Failed to send alert to ${chatId}:`, err.message);
  }
}

module.exports = {
  AVERAGE_DARSHAN_MINUTES,
  initTelegramBot,
  sendTelegramAlert,
};
