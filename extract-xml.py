import pikepdf
#import xml.dom.minidom
#import xml.etree.ElementTree as ET
import re

from bs4 import BeautifulSoup
fname = './af1206-e.pdf'

#BeautifulSoup worked, while minidom and etree failed!

pdfobj = pikepdf.Pdf.open(fname,suppress_warnings=False)

xfaroot = pdfobj.Root.AcroForm.XFA


xfaDict = {}
xmlDict = {}

for i,item in enumerate(xfaroot):
    if(i % 2 == 0 and isinstance(item,pikepdf.String)):
        #print(f'label {i}: {item}')
        label = f'{item}'
        xfaDict[label] = xfaroot[i+1]
        if(isinstance(xfaDict[label],pikepdf.Stream)):
            xmlSubstr = xfaDict[label].read_bytes().decode('utf-8')
        else:
            print('non stream detected')
            xmlSubstr = xfaDict[label]
        #print(xmlSubstr)
        #some fields, like xmpmeta, are in some kind of binary and don't parse very well.
        #xmlSubstr = re.sub(r'^b\'(.*)\'$',r'\1',xmlSubstr)
        #xmlSubstr = re.sub(r'\\n',r'',xmlSubstr)
        
        xmlDict[label] = xmlSubstr
        
    else:
        pass
        #print(f'value: {item.read_bytes()}')


templateSoup = BeautifulSoup(xmlDict['template'],'html.parser')
bulletField = templateSoup.find('field',attrs={'name':'specificAccomplishments'})
height = bulletField['h']
width = bulletField['w']
font = bulletField.font['typeface']
fontSize = bulletField.font['size']
# 202.321mm wide!
#with open('./af1206.xml','w+') as f:
#    print(xml.dom.minidom.parseString(xmlStr).toprettyxml(),file=f)


pdfobj.remove_unreferenced_resources()
pdfobj.close()

