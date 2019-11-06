
import pikepdf
import xml.dom.minidom
fname = './af1206-e.pdf'
pdfobj = pikepdf.Pdf.open(fname,suppress_warnings=False)

xfaroot = pdfobj.Root.AcroForm.XFA

xmldata = ''
for i,item in enumerate(xfaroot):
    if(isinstance(item,pikepdf.String)):
        print(f'label: {item}')
        label = f'{item}'
        if(label == 'datasets'):
            xmlDatastream = xfaroot[i+1]
            xmlString = xmlDatastream.read_bytes()
    else:
        pass
        #print(f'value: {item.read_bytes()}')

print(xmlString)
doc = xml.dom.minidom.parseString(xmlString)

bulletTag = doc.getElementsByTagName('specificAccomplishments')[0]
if(bulletTag.hasChildNodes()):
    bulletTag.childNodes[0].nodeValue = 'hello world!!!!!'
else:
    txt = doc.createTextNode('hello world v2!!!!')
    bulletTag.appendChild(txt)

#documentElement hotfix is needed to omit <?xml version=...> tag at beginning of document
xmlStringEdited = bytes(doc.documentElement.toxml(),'utf-8')
print(xmlStringEdited)
#xmlDatastream.write(xmlStringEdited)
#xmlDatastream.write(b'\n<xfa:datasets xmlns:xfa="http://www.xfa.org/schema/xfa-data/1.0/"\n><xfa:data\n><form1\n><category\n/><nomineeTelephone\n/><awardPeriod\n/><majcom_foa_dru\n/><award\n/><rankName\n/><DAFSC\n/><officeAddress\n/><rank\n/><specificAccomplishments\n>asdhjfklasjdfkljasdfkljasdfkljaskldfj</specificAccomplishments\n><p2Name\n/><p2SpecificAccomplishments\n/></form1\n></xfa:data\n></xfa:datasets\n>')
#xmlDatastream.write(xmlString)
#pdfobj.remove_unreferenced_resources()
pdfobj.save('test.pdf',encryption=pdfobj.encryption)
pdfobj.close()

