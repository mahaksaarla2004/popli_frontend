import fitz
import os

pdf_path = r"C:\Users\Mahek Saarla\Desktop\Personal_Folder\logo files - 1.pdf"
output_dir = r"c:\Users\Mahek Saarla\Desktop\Personal_Folder\popliapp\assets\images"

os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
page = doc[0]  # get first page
pix = page.get_pixmap(dpi=300)  # render page to an image
output_path = os.path.join(output_dir, "logo.png")
pix.save(output_path)
print(f"Rendered: {output_path}")
