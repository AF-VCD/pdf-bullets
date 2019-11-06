
import pikepdf
import xml.dom.minidom
fname = './af1206-e.pdf'
outfname = './test.pdf'
bulletText = """first line
test bullet 1
test bullet 2
refactoring in dictionaries
"""

pdfobj = pikepdf.Pdf.open(fname,suppress_warnings=False)

xfaroot = pdfobj.Root.AcroForm.XFA

xmldata = ''
xfaDict = {}
for i,item in enumerate(xfaroot):
    if(i % 2 == 0 and isinstance(item,pikepdf.String)):
        #print(f'label {i}: {item}')
        label = f'{item}'
        xfaDict[label] = xfaroot[i+1]
    else:
        pass
        #print(f'value: {item.read_bytes()}')

#print(xmlString)

xmlDict = {}
for key,item in xfaDict.items():
    if(isinstance(item,pikepdf.Stream)):
        xmlDict[key] = item.read_bytes()
    else:
        xmlDict[key] = item

xmlFormData = xmlDict['datasets']

formdoc = xml.dom.minidom.parseString(xmlFormData)

bulletTag = formdoc.getElementsByTagName('specificAccomplishments')[0]

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

setTagText(bulletTag,bulletText)


#formdoc.documentElement hotfix is needed to omit <?xml version=...> tag at beginning of document
xmlStringEdited = bytes(formdoc.documentElement.toxml(),'utf-8')
#print(xmlStringEdited)

xfaDict['datasets'].write(xmlStringEdited)


pdfobj.remove_unreferenced_resources()
pdfobj.save(outfname,encryption=True)
#pdfobj.close()

