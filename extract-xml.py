
import pikepdf
import xml.dom.minidom
import xml.etree.ElementTree as ET
import re
fname = './af1206-e.pdf'



pdfobj = pikepdf.Pdf.open(fname,suppress_warnings=False)

xfaroot = pdfobj.Root.AcroForm.XFA

xmlStr = ''
xfaDict = {}
with open('./af1206.xml','w+') as f:
    for i,item in enumerate(xfaroot):
        if(i % 2 == 0 and isinstance(item,pikepdf.String)):
            print(f'label {i}: {item}')
            label = f'{item}'
            xfaDict[label] = xfaroot[i+1]
            if(isinstance(xfaDict[label],pikepdf.Stream)):
                xmlSubstr = repr(xfaDict[label].read_bytes())
            else:
                print('non stream detected')
                xmlSubstr = xfaDict[label]
            print(xmlSubstr)
            xmlSubstr = re.sub(r'^b\'(.*)\'$',r'\1',xmlSubstr)
            xmlSubstr = re.sub(r'\\n',r'',xmlSubstr)
            xmlStr += xmlSubstr
            print(xmlSubstr,file=f)
        else:
            pass
            #print(f'value: {item.read_bytes()}')

ET.fromstring(xmlStr)
#with open('./af1206.xml','w+') as f:
#    print(xml.dom.minidom.parseString(xmlStr).toprettyxml(),file=f)


def setTagText(tag,text):
    if(tag.hasChildNodes()):
        tag.childNodes[0].nodeValue = text
    else:
        txtTag = tag.ownerDocument.createTextNode(text)
        tag.appendChild(txtTag)

def getTagText(tag,text):
    if(tag.hasChildNodes()):
        return tag.childNodes[0].nodeValue
    else:
        return 'None'



pdfobj.remove_unreferenced_resources()
pdfobj.close()

