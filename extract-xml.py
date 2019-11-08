import pikepdf
from bs4 import BeautifulSoup
from xfaTools import XfaObj
fname = './af1206-e.pdf'

#BeautifulSoup worked, while minidom and etree failed!

pdfobj = pikepdf.Pdf.open(fname,suppress_warnings=False)

xfaobj = XfaObj(pdfobj)


templateSoup = BeautifulSoup(xfaobj['template'],'html.parser')
bulletField = templateSoup.find('field',attrs={'name':'specificAccomplishments'})
height = bulletField['h']
width = bulletField['w']
font = bulletField.font['typeface']
fontSize = bulletField.font['size']
# 202.321mm wide!
#with open('./af1206.xml','w+') as f:
#    print(xml.dom.minidom.parseString(xmlStr).toprettyxml(),file=f)

print(f'width:{width}')
print(f'font:{font}')
print(f'font size:{fontSize}')
pdfobj.remove_unreferenced_resources()
pdfobj.close()

