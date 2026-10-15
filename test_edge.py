import subprocess, os, re

edge_exe = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

html = """<!DOCTYPE html>
<html>
<head>
<style>
@page { size: A4 portrait; margin: 1in; }
body { margin: 0; padding: 0; }
.page { page-break-after: always; }
.page:last-child { page-break-after: avoid; }
</style>
</head>
<body>
<div class="page"><h1>Page 1</h1></div>
<div class="page"><h1>Page 2</h1></div>
<div class="page"><h1>Page 3</h1></div>
</body>
</html>"""

with open(r'd:\Projects\DarshanQ\test3.html', 'w') as f:
    f.write(html)

subprocess.run([edge_exe, '--headless', '--disable-gpu', '--print-to-pdf=d:\\Projects\\DarshanQ\\test3.pdf', '--print-to-pdf-no-header', 'file:///d:/Projects/DarshanQ/test3.html'], check=True)

with open(r'd:\Projects\DarshanQ\test3.pdf', 'rb') as f:
    d = f.read()

print('Counts for 3 pages:', re.findall(rb'/Count\s+(\d+)', d))
os.remove(r'd:\Projects\DarshanQ\test3.html')
os.remove(r'd:\Projects\DarshanQ\test3.pdf')
