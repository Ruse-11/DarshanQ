import subprocess, os, re

edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

with open(r'd:\Projects\DarshanQ\DarshanQ_Project_Report.html', 'r', encoding='utf-8') as f:
    full_html = f.read()

# Extract header, style, and body
head_match = re.search(r'<head>.*?</head>', full_html, re.DOTALL)
head = head_match.group(0)

# Modify style in head to ensure .page-sheet print rule
print_rule = """
<style>
@media print {
  body { background: transparent; margin: 0; padding: 0; }
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
</style>
"""

sections = re.findall(r'<section class="page-sheet" id="page-(\d+)">.*?</section>', full_html, re.DOTALL)
print(f"Total sections found: {len(sections)}")

tall_pages = []

for p_num in range(1, 41):
    sec_match = re.search(rf'(<section class="page-sheet" id="page-{p_num}">.*?</section>)', full_html, re.DOTALL)
    if not sec_match:
        print(f"Page {p_num} not found!")
        continue
    sec_html = sec_match.group(1)
    page_html = f"<!DOCTYPE html><html>{head}{print_rule}<body>{sec_html}</body></html>"
    
    tmp_html = f"d:\\Projects\\DarshanQ\\tmp_p{p_num}.html"
    tmp_pdf = f"d:\\Projects\\DarshanQ\\tmp_p{p_num}.pdf"
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(page_html)
        
    subprocess.run([edge_exe, '--headless', '--disable-gpu', f'--print-to-pdf={tmp_pdf}', '--print-to-pdf-no-header', f'file:///{tmp_html.replace("\\\\", "/")}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    with open(tmp_pdf, 'rb') as f:
        data = f.read()
    counts = re.findall(rb'/Count\s+(\d+)', data)
    count = int(counts[0]) if counts else 1
    if count > 1:
        print(f"⚠️ Page {p_num} takes {count} pages!")
        tall_pages.append(p_num)
    else:
        # print(f"Page {p_num} OK")
        pass
        
    os.remove(tmp_html)
    os.remove(tmp_pdf)

print(f"Tall pages that exceed 1 page: {tall_pages}")
