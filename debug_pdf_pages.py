import subprocess, os, re

edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

with open(r'd:\Projects\DarshanQ\DarshanQ_Project_Report.html', 'r', encoding='utf-8') as f:
    full_html = f.read()

# Let's test chunks of 5 pages:
for start in range(1, 41, 5):
    end = min(start + 4, 40)
    expected = end - start + 1
    
    # Extract only sections from start to end
    pattern = rf'(<section class="page-sheet" id="page-{start}">.*?</section>)'
    # Find all sections between start and end
    secs = []
    for i in range(start, end + 1):
        m = re.search(rf'(<section class="page-sheet" id="page-{i}">.*?</section>)', full_html, re.DOTALL)
        if m:
            secs.append(m.group(1))
            
    parts = full_html.split('<body>')
    header_part = parts[0]
    tail_part = parts[1].split('</body>')[1]
    chunk_html = header_part + '<body>\n' + '\n'.join(secs) + '\n</body>' + tail_part
    
    tmp_html = f"d:\\Projects\\DarshanQ\\chunk_{start}_{end}.html"
    tmp_pdf = f"d:\\Projects\\DarshanQ\\chunk_{start}_{end}.pdf"
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(chunk_html)
        
    subprocess.run([edge_exe, '--headless', '--disable-gpu', f'--print-to-pdf={tmp_pdf}', '--print-to-pdf-no-header', f'file:///{tmp_html.replace("\\\\", "/")}'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    with open(tmp_pdf, 'rb') as f:
        data = f.read()
    counts = re.findall(rb'/Count\s+(\d+)', data)
    actual = int(counts[-1]) if counts else 0
    print(f"Pages {start}-{end}: expected {expected}, got {actual}")
    
    os.remove(tmp_html)
    os.remove(tmp_pdf)
