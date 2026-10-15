# -*- coding: utf-8 -*-
"""
pages_front_matter.py
Pages 1 - 4:
- Page 1: Title, Cover Page, Formal Sign-Off Record
- Page 2: Bonafide Certificate & Viva-Voce Examination Certificate
- Page 3: Abstract & Key Contributions
- Page 4: Acknowledgement & Table of Contents (Pages 1 to 40)
"""

def load_pages(add_page):

    # ----------------------------------------------------
    # PAGE 1: TITLE & COVER PAGE
    # ----------------------------------------------------
    p1_html = """
    <div class="cover-container">
      <div class="college-header">
        <div class="college-seal">
          <svg width="65" height="65" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" stroke="#003366" stroke-width="4" fill="#f8fafc"/>
            <circle cx="50" cy="50" r="40" stroke="#b45309" stroke-width="2" stroke-dasharray="4 2"/>
            <path d="M50 20 L65 32 L60 62 L50 75 L40 62 L35 32 Z" fill="#003366"/>
            <path d="M50 25 L60 35 L56 60 L50 70 L44 60 L40 35 Z" fill="#ffffff"/>
            <circle cx="50" cy="45" r="8" fill="#d97706"/>
            <path d="M42 65 C45 60 55 60 58 65" stroke="#003366" stroke-width="2"/>
            <text x="50" y="88" text-anchor="middle" font-size="7" font-weight="bold" fill="#003366">EDUCATE & EXCEL</text>
          </svg>
        </div>
        <div class="inst-title">EASWARI ENGINEERING COLLEGE</div>
        <div class="inst-sub">(AN AUTONOMOUS INSTITUTION) – AFFILIATED TO ANNA UNIVERSITY, CHENNAI</div>
        <div class="inst-dept">DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING</div>
      </div>

      <div class="main-title-box">
        <div class="main-title">DARSHANQ: SMART TEMPLE QUEUE & REAL-TIME CROWD MANAGEMENT SYSTEM</div>
        <div class="sub-report">A PROJECT REPORT</div>
        <div class="fulfillment-text">
          Submitted in partial fulfillment of the requirements for the award of the Degree of<br>
          <strong>BACHELOR OF ENGINEERING</strong><br>
          in<br>
          <strong>COMPUTER SCIENCE AND ENGINEERING</strong>
        </div>
      </div>

      <div class="candidate-box">
        <p style="text-align: center; margin-bottom: 3px; font-size: 8.5pt;"><em>Submitted by:</em></p>
        <p style="text-align: center; margin: 0; font-size: 10.5pt; font-weight: 700; color: #003366;">SURESH R</p>
        <p style="text-align: center; margin: 0; font-size: 8.5pt; font-weight: 600; color: #475569;">(REG. NO: 310621104000)</p>
      </div>

      <div class="signoff-box">
        <div class="signoff-header">PROJECT EVALUATION & FORMAL APPROVAL RECORD</div>
        <p style="font-size: 7.8pt; margin-bottom: 6px; text-align: center; color: #334155;">
          This technical project report has been examined, verified, and recommended for final viva-voce evaluation.
        </p>
        <div class="signoff-row" style="margin-top: 10px;">
          <span><strong>Approved By:</strong> ____________________________________</span>
          <span><strong>Date:</strong> ____________________</span>
        </div>
        <div class="signoff-row" style="margin-top: 4px; font-size: 7.2pt; color: #64748b;">
          <span>Project Supervisor / Viva-Voce Review Committee</span>
          <span>Department Seal & Signature</span>
        </div>
      </div>

      <div style="font-size: 8pt; font-weight: 700; color: #003366;">
        <div>RAMAPURAM, CHENNAI – 600 089, TAMIL NADU, INDIA</div>
        <div style="color: #b45309; margin-top: 2px;">OCTOBER 2026</div>
      </div>
    </div>
    """

    p1_md = """
# DARSHANQ: SMART TEMPLE QUEUE & REAL-TIME CROWD MANAGEMENT SYSTEM
## A PROJECT REPORT

*Submitted in partial fulfillment of the requirements for the award of the Degree of*  
**BACHELOR OF ENGINEERING IN COMPUTER SCIENCE AND ENGINEERING**

**EASWARI ENGINEERING COLLEGE**  
*(An Autonomous Institution – Affiliated to Anna University, Chennai)*  
Ramapuram, Chennai – 600 089, Tamil Nadu, India

---

### CANDIDATE CREDENTIALS:
- **Candidate Name:** SURESH R  
- **Registration Number:** 310621104000  
- **Degree:** Bachelor of Engineering (B.E.)  
- **Department:** Department of Computer Science and Engineering  
- **Academic Year:** 2025–2026 | **Submission Date:** October 2026  

---

### FORMAL PROJECT REVIEW & APPROVAL BLOCK

**Approved By:** ____________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **Date:** ____________________  
*(Project Guide / Head of the Department / Viva-Voce Review Committee)*

---
    """
    add_page(1, "Cover Page & Sign-Off Record", p1_html, p1_md)

    # ----------------------------------------------------
    # PAGE 2: BONAFIDE & VIVA-VOCE CERTIFICATES
    # ----------------------------------------------------
    p2_html = """
    <div class="cert-block">
      <div style="text-align: center;">
        <h2 style="font-size: 12.5pt; margin-bottom: 2px; color: #003366;">EASWARI ENGINEERING COLLEGE</h2>
        <p style="font-size: 7.8pt; color: #475569; margin-bottom: 8px;">(An Autonomous Institution – Affiliated to Anna University, Chennai)</p>
        <h3 style="font-size: 10.5pt; letter-spacing: 0.08em; border-bottom: 1.5px solid #003366; display: inline-block; padding-bottom: 2px;">BONAFIDE CERTIFICATE</h3>
      </div>

      <p style="font-size: 8.6pt; line-height: 1.48; text-align: justify; margin: 10px 0;">
        Certified that this mini project report titled <strong>“DARSHANQ: SMART TEMPLE QUEUE & REAL-TIME CROWD MANAGEMENT SYSTEM”</strong> is the bonafide work of <strong>SURESH R (Reg. No. 310621104000)</strong>, who carried out the project work under my supervision in partial fulfillment of the requirements for the award of the degree of <strong>Bachelor of Engineering in Computer Science and Engineering</strong> of Easwari Engineering College, Chennai.
      </p>

      <div style="display: flex; justify-content: space-between; margin-top: 25px;">
        <div style="width: 45%; text-align: center;">
          <div style="border-top: 1px solid #0f172a; margin-bottom: 3px; padding-top: 3px;"></div>
          <p style="margin: 0; font-size: 8pt; font-weight: 700;">HEAD OF THE DEPARTMENT</p>
          <p style="margin: 0; font-size: 7.2pt; color: #475569;">Department of Computer Science & Engg.<br>Easwari Engineering College, Chennai</p>
        </div>
        <div style="width: 45%; text-align: center;">
          <div style="border-top: 1px solid #0f172a; margin-bottom: 3px; padding-top: 3px;"></div>
          <p style="margin: 0; font-size: 8pt; font-weight: 700;">SUPERVISOR / PROJECT GUIDE</p>
          <p style="margin: 0; font-size: 7.2pt; color: #475569;">Department of Computer Science & Engg.<br>Easwari Engineering College, Chennai</p>
        </div>
      </div>

      <div style="border-top: 1px dashed #cbd5e1; margin: 15px 0;"></div>

      <div style="text-align: center;">
        <h3 style="font-size: 10.5pt; letter-spacing: 0.08em; border-bottom: 1.5px solid #003366; display: inline-block; padding-bottom: 2px;">CERTIFICATE OF VIVA-VOCE EXAMINATION</h3>
      </div>

      <p style="font-size: 8.6pt; line-height: 1.48; text-align: justify; margin: 10px 0;">
        This is to certify that the Viva-Voce Examination of the Project Work entitled <strong>“DARSHANQ: SMART TEMPLE QUEUE & REAL-TIME CROWD MANAGEMENT SYSTEM”</strong> submitted by <strong>SURESH R (Reg. No. 310621104000)</strong> in partial fulfillment of the requirements for the degree of <strong>Bachelor of Engineering in Computer Science and Engineering</strong> was conducted on ____________________ in the Department of Computer Science and Engineering, Easwari Engineering College, Ramapuram, Chennai.
      </p>

      <div style="display: flex; justify-content: space-between; margin-top: 25px;">
        <div style="width: 45%; text-align: left; font-size: 7.8pt;">
          <div style="border-top: 1px solid #0f172a; margin-bottom: 3px; padding-top: 3px; font-weight: 700;">INTERNAL EXAMINER</div>
          <p style="margin: 0;">Name: ________________________________</p>
          <p style="margin: 0;">Designation: _________________________</p>
          <p style="margin: 0;">Date: ________________________________</p>
        </div>
        <div style="width: 45%; text-align: left; font-size: 7.8pt;">
          <div style="border-top: 1px solid #0f172a; margin-bottom: 3px; padding-top: 3px; font-weight: 700;">EXTERNAL EXAMINER</div>
          <p style="margin: 0;">Name: ________________________________</p>
          <p style="margin: 0;">Designation: _________________________</p>
          <p style="margin: 0;">Date: ________________________________</p>
        </div>
      </div>
    </div>
    """

    p2_md = """
## BONAFIDE CERTIFICATE

Certified that this mini project report titled **“DARSHANQ: SMART TEMPLE QUEUE & REAL-TIME CROWD MANAGEMENT SYSTEM”** is the bonafide work of **SURESH R (Reg. No. 310621104000)**, who carried out the project work under my supervision in partial fulfillment of the requirements for the award of the degree of **Bachelor of Engineering in Computer Science and Engineering** of Easwari Engineering College, Chennai.

| **HEAD OF THE DEPARTMENT** | **SUPERVISOR / PROJECT GUIDE** |
| :--- | :--- |
| Signature: __________________________ | Signature: __________________________ |
| Dept. of Computer Science and Engineering | Dept. of Computer Science and Engineering |
| Easwari Engineering College, Chennai | Easwari Engineering College, Chennai |

---

## CERTIFICATE OF VIVA-VOCE EXAMINATION

This is to certify that the Viva-Voce Examination of the Project Work entitled **“DARSHANQ: SMART TEMPLE QUEUE & REAL-TIME CROWD MANAGEMENT SYSTEM”** submitted by **SURESH R (Reg. No. 310621104000)** was conducted on ____________________ in the Department of Computer Science and Engineering, Easwari Engineering College, Ramapuram – Chennai.

| **INTERNAL EXAMINER** | **EXTERNAL EXAMINER** |
| :--- | :--- |
| Name: __________________________ | Name: __________________________ |
| Designation: ____________________ | Designation: ____________________ |
| Date: __________________________ | Date: __________________________ |
    """
    add_page(2, "Bonafide & Examination Certificates", p2_html, p2_md)

    # ----------------------------------------------------
    # PAGE 3: ABSTRACT & SYSTEM CHARACTERISTICS
    # ----------------------------------------------------
    p3_html = """
    <h1 class="chapter-title">ABSTRACT</h1>

    <p>
      Religious pilgrimage centers and monumental temple complexes represent some of the highest-density human gatherings on Earth. Leading Indian temples such as Tirupati, Vaishno Devi, Puri Jagannath, and Sabarimala routinely register daily congregations exceeding 80,000 to 150,000 devotees. Conventional crowd control mechanisms at these sites remain fundamentally physical, relying on miles of serpentine steel barricades, holding compartments, and manual baton policing. Within these static holding zones, devotees are subjected to 6 to 12 hours of agonizing standing time under extreme heat and humidity with zero awareness of queue velocity or expected Sanctum arrival times.
    </p>

    <p>
      This opacity triggers acute psychological stress, medical emergencies, queue-jumping disputes, and catastrophic crowd crush risks when bottlenecks occur at the Sanctum threshold. In response to this crisis, this project presents <strong>DarshanQ</strong>, an intelligent, full-stack, real-time queue orchestration and crowd density management platform.
    </p>

    <h2 class="section-title">Key Architectural Innovations</h2>
    <ul style="margin: 4px 0 8px 18px; font-size: 8.6pt; line-height: 1.45;">
      <li><strong>Virtual Tokenization:</strong> Replaces physical queue lines with cryptographic virtual tokens, allowing devotees to wait in open courtyards, community halls, or local hotels.</li>
      <li><strong>Directed Graph Temple Topology:</strong> Mathematically models temple pathways as a directed graph consisting of <em>3 Entry Gates</em> feeding into <em>3 Security Checkpoints</em>, converging into a single <em>Holy Inner Sanctum</em>.</li>
      <li><strong>Explainable Queue Intelligence Engine:</strong> Implements a deterministic, explainable wait-time formula driven by a 15-minute sliding scan window velocity ($W = N_{ahead} / \\max(R_{scan}, 0.1)$), replacing opaque ML predictions.</li>
      <li><strong>Bi-Directional WebSocket Sync:</strong> Uses Socket.IO room multiplexing to broadcast live queue progression, density updates, and proximity alerts instantaneously with zero browser refreshes.</li>
      <li><strong>Omni-Channel Telegram Bot:</strong> Provides headless smartphone tracking via Telegram, allowing devotees to receive automated turn alerts even with closed web applications.</li>
    </ul>

    <div class="formula-callout">
      <strong>Core Engineering Philosophy:</strong> Transforming mass crowd management from reactive containment to proactive, transparent, and algorithmic flow control.
    </div>

    <div style="font-size: 8.2pt; margin-top: 8px;">
      <strong>Keywords:</strong> Virtual Queueing, Little's Law, Real-Time WebSockets, PostgreSQL, Directed Graph, Explainable Queue Engine, Crowd Safety, Telegram Bot.
    </div>
    """

    p3_md = """
# ABSTRACT

Religious pilgrimage centers and monumental temple complexes represent some of the highest-density human gatherings on Earth. Leading Indian temples routinely register daily congregations exceeding 80,000 to 150,000 devotees. Conventional crowd control mechanisms remain fundamentally physical, relying on miles of serpentine steel barricades and manual policing. Devotees endure 6 to 12 hours of agonizing standing time with zero awareness of queue velocity.

This opacity triggers acute psychological stress, medical emergencies, and catastrophic crowd crush risks. In response, this project presents **DarshanQ**, an intelligent, full-stack, real-time queue orchestration and crowd density management platform.

### Key Architectural Innovations:
1. **Virtual Tokenization:** Replaces physical queue lines with cryptographic virtual tokens.
2. **Directed Graph Temple Topology:** Models pathways as a directed graph (3 Entry Gates ➔ 3 Security Checkpoints ➔ 1 Holy Sanctum).
3. **Explainable Queue Intelligence Engine:** Implements a deterministic wait-time formula based on a 15-minute sliding scan velocity.
4. **Bi-Directional WebSocket Sync:** Broadcasts live queue updates and alerts via Socket.IO with zero page refreshes.
5. **Omni-Channel Telegram Bot:** Enables mobile out-of-app tracking and alerts.

**Keywords:** Virtual Queueing, Little's Law, Real-Time WebSockets, PostgreSQL, Directed Graph, Explainable Queue Engine, Crowd Safety, Telegram Bot.
    """
    add_page(3, "Abstract & System Innovation", p3_html, p3_md)

    # ----------------------------------------------------
    # PAGE 4: ACKNOWLEDGEMENT & TABLE OF CONTENTS
    # ----------------------------------------------------
    p4_html = """
    <div style="margin-bottom: 8px;">
      <h2 style="font-size: 10.5pt; color: #003366; margin-bottom: 3px; border-bottom: 1.5px solid #003366;">ACKNOWLEDGEMENT</h2>
      <p style="font-size: 7.8pt; line-height: 1.35; margin-bottom: 6px;">
        We express our sincere gratitude to our respected Principal, <strong>Dr. P. Deiva Sundari</strong>, and the Management of <strong>Easwari Engineering College</strong> for providing state-of-the-art computational laboratories. We convey heartfelt thanks to our <strong>Head of the Department</strong> and our esteemed <strong>Project Guide</strong> for their continuous guidance, technical reviews, and academic support throughout the development of DarshanQ.
      </p>
    </div>

    <div>
      <h2 style="font-size: 10.5pt; color: #003366; margin-bottom: 4px; border-bottom: 1.5px solid #003366;">TABLE OF CONTENTS</h2>
      <table class="data-table" style="font-size: 7.4pt; line-height: 1.22; margin-top: 3px;">
        <thead>
          <tr>
            <th style="width: 15%;">SECTION</th>
            <th style="width: 73%;">CHAPTER & SECTION TITLE</th>
            <th style="width: 12%; text-align: right;">PAGE</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>FRONT</strong></td><td>Title, Certificates, Abstract, Acknowledgement & TOC</td><td align="right">1 – 4</td></tr>
          <tr><td><strong>CHAPTER 1</strong></td><td><strong>INTRODUCTION & OBJECTIVES</strong></td><td align="right"><strong>5 – 8</strong></td></tr>
          <tr><td></td><td>1.1 Overview & Background &nbsp;|&nbsp; 1.2 Problem Definition</td><td align="right">5 – 6</td></tr>
          <tr><td></td><td>1.3 Project Objectives &nbsp;|&nbsp; 1.4 Project Scope &nbsp;|&nbsp; 1.5 Motivation</td><td align="right">7 – 8</td></tr>
          <tr><td><strong>CHAPTER 2</strong></td><td><strong>RELATED WORK & LITERATURE REVIEW</strong></td><td align="right"><strong>9 – 10</strong></td></tr>
          <tr><td></td><td>2.1 Literature Survey &nbsp;|&nbsp; 2.2 Existing Systems vs 2.3 Proposed DarshanQ</td><td align="right">9 – 10</td></tr>
          <tr><td><strong>CHAPTER 3</strong></td><td><strong>SYSTEM ANALYSIS & REQUIREMENTS SPECIFICATION</strong></td><td align="right"><strong>11</strong></td></tr>
          <tr><td></td><td>3.1 Functional Requirements &nbsp;|&nbsp; 3.2 Non-Functional & HW/SW Specs</td><td align="right">11</td></tr>
          <tr><td><strong>CHAPTER 4</strong></td><td><strong>SYSTEM ARCHITECTURE & DESIGN</strong></td><td align="right"><strong>12 – 16</strong></td></tr>
          <tr><td></td><td>4.1 Tiered Client-Server Architecture &nbsp;|&nbsp; 4.2 Temple Flow Topology Graph</td><td align="right">12 – 13</td></tr>
          <tr><td></td><td>4.3 Relational Database Schema &nbsp;|&nbsp; 4.4 Class & Component Architecture</td><td align="right">14 – 15</td></tr>
          <tr><td></td><td>4.5 Sequence Diagrams: Booking & Checkpoint Progression Flows</td><td align="right">16</td></tr>
          <tr><td><strong>CHAPTER 5</strong></td><td><strong>IMPLEMENTATION & KEY CODE SNIPPETS</strong></td><td align="right"><strong>17 – 28</strong></td></tr>
          <tr><td></td><td>5.1 Tech Stack Scaffolding &nbsp;|&nbsp; 5.2 Database Pool & SSL Configuration</td><td align="right">17 – 18</td></tr>
          <tr><td></td><td>5.3 Cryptographic Auth & RBAC &nbsp;|&nbsp; 5.4 Token Booking & Auto-Balancing</td><td align="right">19 – 20</td></tr>
          <tr><td></td><td>5.5 Wait-Time Engine Formula &nbsp;|&nbsp; 5.6 Checkpoint Scan Controller</td><td align="right">21 – 22</td></tr>
          <tr><td></td><td>5.7 Bi-Directional WebSockets &nbsp;|&nbsp; 5.8 Telegram Bot Integration Service</td><td align="right">23 – 24</td></tr>
          <tr><td></td><td>5.9 Devotee Web Portal &nbsp;|&nbsp; 5.10 Zero-Scroll Staff Terminal</td><td align="right">25 – 26</td></tr>
          <tr><td></td><td>5.11 Admin Command Center &nbsp;|&nbsp; 5.12 SVG Temple Flow Map Component</td><td align="right">27 – 28</td></tr>
          <tr><td><strong>CHAPTER 6</strong></td><td><strong>TESTING, VERIFICATION & SCREENSHOTS</strong></td><td align="right"><strong>29 – 36</strong></td></tr>
          <tr><td></td><td>6.1 Testing Methodology &nbsp;|&nbsp; 6.2 Auth & Token Booking Test Suite</td><td align="right">29 – 30</td></tr>
          <tr><td></td><td>6.3 Checkpoint Scan & WebSocket Test Suite &nbsp;|&nbsp; 6.4 UI Verification: Devotee Pass</td><td align="right">31 – 32</td></tr>
          <tr><td></td><td>6.5 Staff Terminal Modal &nbsp;|&nbsp; 6.6 Admin Command Center Verification</td><td align="right">33 – 34</td></tr>
          <tr><td></td><td>6.7 Telegram Bot Alerts &nbsp;|&nbsp; 6.8 Latency & Performance Benchmarks</td><td align="right">35 – 36</td></tr>
          <tr><td><strong>CHAPTER 7</strong></td><td><strong>CONCLUSION & FUTURE SCOPE</strong></td><td align="right"><strong>37 – 39</strong></td></tr>
          <tr><td></td><td>7.1 Project Conclusion &nbsp;|&nbsp; 7.2 Known Simplifications & Trade-offs</td><td align="right">37 – 38</td></tr>
          <tr><td></td><td>7.3 Future Enhancements (Computer Vision IoT, RFID Turnstiles)</td><td align="right">39</td></tr>
          <tr><td><strong>CHAPTER 8</strong></td><td><strong>REFERENCES</strong></td><td align="right"><strong>40</strong></td></tr>
        </tbody>
      </table>
    </div>
    """

    p4_md = """
# ACKNOWLEDGEMENT & TABLE OF CONTENTS

### ACKNOWLEDGEMENT
We express our sincere gratitude to our Principal, **Dr. P. Deiva Sundari**, Head of the Department, and our Project Guide at **Easwari Engineering College** for their support and academic guidance.

---

### TABLE OF CONTENTS (EXACT 40-PAGE STRUCTURE)

| Chapter | Title | Pages |
| :--- | :--- | :---: |
| Front Matter | Title, Certificates, Abstract, TOC | 1 – 4 |
| Chapter 1 | Introduction & Objectives | 5 – 8 |
| Chapter 2 | Related Work & Literature Review | 9 – 10 |
| Chapter 3 | System Analysis & Requirements | 11 |
| Chapter 4 | System Architecture & Design | 12 – 16 |
| Chapter 5 | Implementation & Key Code Snippets | 17 – 28 |
| Chapter 6 | Testing, Verification & Screenshots | 29 – 36 |
| Chapter 7 | Conclusion & Future Scope | 37 – 39 |
| Chapter 8 | References | 40 |
    """
    add_page(4, "Acknowledgement & Table of Contents", p4_html, p4_md)
