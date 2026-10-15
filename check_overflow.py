import subprocess, os, re

edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

with open(r'd:\Projects\DarshanQ\DarshanQ_Project_Report.html', 'r', encoding='utf-8') as f:
    full_html = f.read()

parts = full_html.split('<body>')
header_part = parts[0]
tail_part = parts[1].split('</body>')[1]

for p in range(16, 26):
    m = re.search(rf'(<section class="page-sheet" id="page-{p}">.*?</section>)', full_html, re.DOTALL)
    if not m:
        continue
    sec = m.group(1)
    chunk_html = header_part + '<body>\n' + sec + '\n</body>' + tail_part
    tmp_html = f"d:\\Projects\\DarshanQ\\test_p{p}.html"
    tmp_pdf = f"d:\\Projects\\DarshanQ\\test_p{p}.pdf"
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(chunk_html)
    subprocess.run([edge_exe, '--headless', '--disable-gpu', f'--print-to-pdf={tmp_pdf}', '--print-to-pdf-no-header', f'file:///{tmp_html.replace(chr(92), "/")}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    with open(tmp_pdf, 'rb') as f:
        data = f.read()
    counts = re.findall(rb'/Count\s+(\d+)', data)
    cnt = int(counts[-1]) if counts else 0
    print(f"Page {p}: got {cnt} pages")
    os.remove(tmp_html)
    os.remove(tmp_pdf)
