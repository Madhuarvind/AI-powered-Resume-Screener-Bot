from PyPDF2 import PdfMerger

pdf1 = r"C:\Users\Admin\Downloads\GEN AI REPORT SAMPLE.pdf"  # first PDF
pdf2 = r"C:\Users\Admin\Downloads\927623BAM037 -  NADIN SURYA S.pdf"
pdf3 = r"C:\Users\Admin\Downloads\Madhu report gai.pdf"   # second PDF
output_pdf = r"C:\Users\Admin\Downloads\927623BAM032-Madhuaravind P.pdf"

merger = PdfMerger()

# Append PDFs in your desired order
merger.append(pdf1)
merger.append(pdf2)
merger.append(pdf3)

# Save the merged file
with open(output_pdf, "wb") as final_pdf:
    merger.write(final_pdf)

merger.close()

print("Merged PDF saved at:", output_pdf)
