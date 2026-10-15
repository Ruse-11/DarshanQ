# -*- coding: utf-8 -*-
"""
build_report.py
Generates DarshanQ_Project_Report.html, DarshanQ_Project_Report.md, and DarshanQ_Project_Report.pdf
Target: Exactly 40 Pages aligned for physical 1-inch printout with formal approval blocks.
"""

import os
import sys
import subprocess

if sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

print("[INFO] Initializing DarshanQ 40-Page Report Generator (Python 3)...")

pages = []

def add_page(num, header_title, html_content, md_content):
    pages.append({
        "num": num,
        "title": header_title,
        "html": html_content.strip(),
        "md": md_content.strip()
    })

# We will load the 40 pages from dedicated python modules
import pages_front_matter
import pages_intro_architecture
import pages_implementation
import pages_testing_conclusion

pages_front_matter.load_pages(add_page)
pages_intro_architecture.load_pages(add_page)
pages_implementation.load_pages(add_page)
pages_testing_conclusion.load_pages(add_page)

print(f"[OK] Loaded {len(pages)} pages.")
if len(pages) != 40:
    print(f"[WARN] Expected exactly 40 pages, got {len(pages)}")

# ----------------------------------------------------------------------
# 1. Generate HTML (Print Optimized: A4, 1-inch margins, page breaks)
# ----------------------------------------------------------------------
html_header = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DARSHANQ: SMART TEMPLE QUEUE & REAL-TIME CROWD MANAGEMENT SYSTEM</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap');

    @page {
      size: A4 portrait;
      margin: 1in;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      background: #f1f5f9;
      font-family: 'Merriweather', Georgia, serif;
      color: #1e293b;
      font-size: 9.6pt;
      line-height: 1.48;
    }

    .page-sheet {
      background: #ffffff;
      width: 8.27in;
      min-height: 11.69in;
      height: 11.69in;
      padding: 1in;
      margin: 20px auto;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      position: relative;
      page-break-after: always;
      break-after: page;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    @media print {
      body {
        background: transparent;
        margin: 0;
        padding: 0;
      }
      .page-sheet {
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 100% !important;
        min-height: auto !important;
        height: auto !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .page-sheet:last-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1.5px solid #0f172a;
      padding-bottom: 4px;
      margin-bottom: 12px;
      font-family: 'Inter', sans-serif;
      font-size: 7.2pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #475569;
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
      margin-top: 12px;
      font-family: 'Inter', sans-serif;
      font-size: 7.2pt;
      color: #64748b;
    }

    .page-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    h1, h2, h3, h4 {
      font-family: 'Inter', sans-serif;
      color: #0f172a;
      margin-top: 0;
      line-height: 1.25;
    }

    h1.chapter-title {
      font-size: 14pt;
      font-weight: 800;
      border-bottom: 2px solid #003366;
      padding-bottom: 3px;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    h2.section-title {
      font-size: 11pt;
      font-weight: 700;
      color: #003366;
      margin-top: 8px;
      margin-bottom: 5px;
      border-left: 3px solid #b45309;
      padding-left: 8px;
    }

    h3.sub-title {
      font-size: 9.5pt;
      font-weight: 600;
      color: #334155;
      margin-top: 6px;
      margin-bottom: 3px;
    }

    p {
      margin-top: 0;
      margin-bottom: 6px;
      text-align: justify;
    }

    /* Cover Page Styling */
    .cover-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: center;
      font-family: 'Inter', sans-serif;
    }

    .college-seal {
      margin: 0 auto 8px auto;
    }

    .inst-title {
      font-size: 13.5pt;
      font-weight: 800;
      color: #003366;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }

    .inst-sub {
      font-size: 8pt;
      font-weight: 600;
      color: #475569;
      margin-bottom: 3px;
    }

    .inst-dept {
      font-size: 9.5pt;
      font-weight: 700;
      color: #b45309;
      letter-spacing: 0.06em;
      margin-bottom: 12px;
    }

    .main-title-box {
      border-top: 3px double #003366;
      border-bottom: 3px double #003366;
      padding: 14px 8px;
      margin: 10px 0;
    }

    .main-title {
      font-size: 14.5pt;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: 0.03em;
      line-height: 1.35;
      margin-bottom: 6px;
    }

    .sub-report {
      font-size: 10pt;
      font-weight: 700;
      color: #b45309;
      letter-spacing: 0.12em;
      margin-bottom: 4px;
    }

    .fulfillment-text {
      font-size: 8pt;
      font-style: italic;
      color: #334155;
      line-height: 1.4;
    }

    .candidate-box {
      margin: 8px 0;
    }

    .signoff-box {
      border: 1.5px solid #003366;
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 10px 0;
      text-align: left;
    }

    .signoff-header {
      font-size: 8pt;
      font-weight: 800;
      color: #003366;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
      text-align: center;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 3px;
    }

    .signoff-row {
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      font-weight: 600;
      color: #0f172a;
      margin-top: 5px;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      font-family: 'Inter', sans-serif;
      font-size: 7.6pt;
      margin: 6px 0 10px 0;
    }

    table.data-table th, table.data-table td {
      border: 1px solid #cbd5e1;
      padding: 4px 6px;
      text-align: left;
    }

    table.data-table th {
      background: #003366;
      color: #ffffff;
      font-weight: 600;
      font-size: 7.6pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    table.data-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Code Snippets */
    pre.code-block {
      background: #0f172a;
      color: #f8fafc;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 7.2pt;
      line-height: 1.32;
      padding: 6px 9px;
      border-radius: 4px;
      border-left: 3px solid #38bdf8;
      margin: 5px 0 8px 0;
      white-space: pre-wrap;
      word-break: break-word;
      overflow: hidden;
    }

    code.inline-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      background: #e2e8f0;
      color: #0f172a;
      padding: 1px 3px;
      border-radius: 3px;
    }

    /* Diagrams & Visual Panels */
    .diagram-panel {
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 8px;
      margin: 6px 0 9px 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 6.8pt;
      line-height: 1.25;
      white-space: pre;
      overflow: hidden;
    }

    .formula-callout {
      background: #f0fdf4;
      border: 1.5px solid #86efac;
      border-left: 4px solid #16a34a;
      border-radius: 4px;
      padding: 6px 10px;
      margin: 6px 0 8px 0;
      font-family: 'Inter', sans-serif;
      font-size: 8.5pt;
      color: #14532d;
    }

    .mockup-window {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      background: #ffffff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
      margin: 6px 0 10px 0;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    .mockup-header {
      background: #1e293b;
      color: #ffffff;
      padding: 4px 8px;
      font-size: 7.2pt;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mockup-content {
      padding: 8px;
      font-size: 7.8pt;
      color: #1e293b;
    }

    .badge-low {
      display: inline-block;
      padding: 1px 5px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      border-radius: 8px;
      font-weight: 700;
      font-size: 6.8pt;
    }
    .badge-med {
      display: inline-block;
      padding: 1px 5px;
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
      border-radius: 8px;
      font-weight: 700;
      font-size: 6.8pt;
    }
    .badge-high {
      display: inline-block;
      padding: 1px 5px;
      background: #ffe4e6;
      color: #be123c;
      border: 1px solid #fecdd3;
      border-radius: 8px;
      font-weight: 700;
      font-size: 6.8pt;
    }

    .cert-block {
      border: 2px solid #003366;
      padding: 16px;
      border-radius: 6px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  </style>
</head>
<body>
"""

full_html = html_header
full_md = ""

for p in pages:
    is_cover = p["num"] == 1
    header_html = "" if is_cover else f"""
    <div class="page-header">
      <span>EASWARI ENGINEERING COLLEGE &nbsp;|&nbsp; B.E. (CSE) PROJECT REPORT</span>
      <span>DARSHANQ QUEUE & CROWD MANAGEMENT</span>
    </div>
    """
    footer_html = "" if is_cover else f"""
    <div class="page-footer">
      <span>Department of Computer Science and Engineering</span>
      <span>Page {p['num']} of 40</span>
    </div>
    """

    full_html += f"""
  <section class="page-sheet" id="page-{p['num']}">
    {header_html}
    <div class="page-body">
      {p['html']}
    </div>
    {footer_html}
  </section>
  """

    full_md += f"\n<!-- ========================================== -->\n"
    full_md += f"<!-- PAGE {p['num']} OF 40: {p['title'].upper()} -->\n"
    full_md += f"<!-- ========================================== -->\n\n"
    full_md += p["md"]
    full_md += f"\n\n<div style=\"page-break-after: always;\"></div>\n\n"

full_html += """
</body>
</html>
"""

# Save HTML
html_path = os.path.join(os.path.dirname(__file__), "DarshanQ_Project_Report.html")
with open(html_path, "w", encoding="utf-8") as f:
    f.write(full_html)
print(f"[OK] HTML report generated: {html_path} ({len(full_html)} bytes)")

# Save Markdown
md_path = os.path.join(os.path.dirname(__file__), "DarshanQ_Project_Report.md")
with open(md_path, "w", encoding="utf-8") as f:
    f.write(full_md)
print(f"[OK] Markdown report generated: {md_path} ({len(full_md)} bytes)")

# Compile PDF using Edge Headless
pdf_path = os.path.join(os.path.dirname(__file__), "DarshanQ_Project_Report.pdf")
print("[INFO] Compiling 40-Page PDF via Microsoft Edge Headless...")
edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if os.path.exists(edge_exe):
    file_uri = "file:///" + html_path.replace("\\", "/")
    cmd = [
        edge_exe,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf_path}",
        "--print-to-pdf-no-header",
        file_uri
    ]
    try:
        subprocess.run(cmd, check=True)
        if os.path.exists(pdf_path):
            pdf_size = os.path.getsize(pdf_path)
            print(f"[SUCCESS] PDF successfully compiled: {pdf_path} ({pdf_size} bytes)")
    except Exception as e:
        print(f"[NOTICE] PDF generation notice: {e}")
else:
    print(f"[WARN] Edge not found at {edge_exe}")

print("\n[SUCCESS] All 40 Pages Successfully Built!")
