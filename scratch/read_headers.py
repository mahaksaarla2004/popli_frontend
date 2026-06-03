import fitz
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r"C:\Users\Mahek Saarla\Desktop\Personal_Folder\Flow Popli.pdf"
doc = fitz.open(pdf_path)

for i in range(len(doc)):
    page = doc[i]
    text = page.get_text().split('\n')
    print(f"--- Page {i+1} ---")
    count = 0
    for line in text:
        if line.strip():
            print(line.strip())
            count += 1
        if count >= 10:
            break
