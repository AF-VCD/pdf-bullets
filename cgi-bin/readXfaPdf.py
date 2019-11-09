print("Content-Type: text/plain;charset=utf-8")
print()

import ssl
import cgi

form = cgi.FieldStorage()
pdfdata = form.getvalue("pdf")
print(pdfdata)