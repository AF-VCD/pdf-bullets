function getBulletsFromPdf(filedata){
    var pdfSetup = filedata.arrayBuffer().then(function(buffer){
        var uint8Array = new Uint8Array(buffer);
        var pdf = new PDFDocument(null, uint8Array);
        pdf.parseStartXRef();
        pdf.parse();
        return pdf;
    });

    var getXFA = pdfSetup.then(function(pdf){
        var xref = pdf.xref;
        var root = xref.trailer;
        var xfa = pdf.acroForm.get('XFA');
        var xfaDict = [];
        for (var i = 0; i < xfa.length;i++){
            if(i % 2 == 0 ){                
                var str = '';
                for (var byte of xref.fetch(xfa[i+1]).getBytes()){
                    str += String.fromCharCode(byte)
                }
                xfaDict[xfa[i]] = str;
            }
        }
        //console.log(xfaDict);
        return xfaDict;
    });

    var pullBullets = getXFA.then(function(xfaDict){
        datasetXML = xfaDict['datasets'];
        datasetXML = datasetXML.replace(/&#xD;/g,'\n');
        var parser = new DOMParser();
        xmlDoc = parser.parseFromString(datasetXML, "text/xml");
        bulletTag = xmlDoc.querySelector('specificAccomplishments');
        //bulletText = bulletText.replace(/&#xD;/g,'\n')
        //console.log(bulletText);
        //console.log(bulletTag);
        //console.log(xfaDict['template']);
        return bulletTag.innerHTML;
    });

    var getPageInfo = getXFA.then(function(xfaDict){
        var templateXML = xfaDict['template'];
        var parser = new DOMParser();
        xmlDoc = parser.parseFromString(templateXML, "text/xml");
        bulletTag =xmlDoc.querySelector("field[name='specificAccomplishments'");
        font = bulletTag.querySelector('font').getAttribute('typeface');
        fontSize = bulletTag.querySelector('font').getAttribute('size');
        width = bulletTag.getAttribute('w');
        //console.log(xmlDoc)
        return {'font': font, 'fontSize':fontSize, 'width':width}
        
        //accomplishmentsTag = templateXML.match(/name="specificAccomplishments"(.*?)<\/field/);
        //console.log(accomplishmentsTag)
    });
    return {'pullBullets': pullBullets, 'getPageInfo':getPageInfo};
}