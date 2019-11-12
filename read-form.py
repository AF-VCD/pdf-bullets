import pikepdf
from xfaTools import XfaObj
from bs4 import BeautifulSoup
fname = './af1206-blank.pdf'
outfname = './test.pdf'
bulletText = """testing overflow line:
1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0
"""

with pikepdf.Pdf.open(fname,suppress_warnings=False) as pdfobj:
    
    xfaobj = XfaObj(pdfobj)

    tagName = 'specificAccomplishments'
    xfaField = 'datasets'

    #html.parser seemed nice, but it was not case sensitive. xml parser necessary.
    formSoup = BeautifulSoup(xfaobj[xfaField],'xml')
    targetTag = formSoup.find(tagName)
    targetTag.string = bulletText

    #findchild() hotfix is needed to omit <?xml version=...> tag at beginning of document
    xmlStringEdited = str(formSoup.findChild())
    print(xmlStringEdited)

    xfaobj[xfaField] = xmlStringEdited


    pdfobj.remove_unreferenced_resources()
    pdfobj.save(outfname,encryption=False)
