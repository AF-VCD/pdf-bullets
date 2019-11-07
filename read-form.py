
import pikepdf

from bs4 import BeautifulSoup
fname = './af1206-blank.pdf'
outfname = './test.pdf'
bulletText = """first line
test bullet 1
test bullet 2
refactoring in dictionaries
refactoring in beautifulsoup
"""

tagName = 'specificAccomplishments'
xfaField = 'datasets'

pdfobj = pikepdf.Pdf.open(fname,suppress_warnings=False)

#things I want to be able to do:
#  pdfobj --> xfa array/dict-like structure
#  indexed xfa obj --> return text representation
# indexed xfa obj --> write input

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


#html.parser seemed to work the best!
#never mind, html.parser was not case sensitive enough.
formSoup = BeautifulSoup(xmlDict[xfaField],'xml')
targetTag = formSoup.find(tagName)

targetTag.string = bulletText

#findchild() hotfix is needed to omit <?xml version=...> tag at beginning of document
xmlStringEdited = bytes(str(formSoup.findChild()),'utf-8')
print(xmlStringEdited)

xfaDict[xfaField].write(xmlStringEdited)


pdfobj.remove_unreferenced_resources()
pdfobj.save(outfname,encryption=True)
pdfobj.close()

