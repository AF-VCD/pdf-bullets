class Forms{ 
static all = {
        'AF707': {
            'fields': ['S2DutyTitleDesc','S4Assessment','S5Assessment','S6Assessment'],
            'likelyWidth':'201.041mm'
        },
        'AF1206': {
            'fields': ['specificAccomplishments','p2SpecificAccomplishments'],
            'likelyWidth':'202.321mm'
        },
        'AF910': {
            'fields': ['KeyDuties','IIIComments','IVComments','VComments'],
            'likelyWidth':'202.321mm'
        },
        'AF911': {
            'fields': ['KeyDuties','IIIComments','IVComments'],
            'likelyWidth':'202.321mm'
        },
    }
}


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
        //window.test1 = pdf;
        var xfa = pdf.acroForm.get('XFA');
        var xfaDict = [];
        for (var i = 0; i < xfa.length;i++){
            if(i % 2 == 0 ){                
                var str = '';
                var bytes = xref.fetch(xfa[i+1]).getBytes()

                xfaDict[xfa[i]] = new TextDecoder().decode(bytes)
                //console.log(new TextDecoder().decode(bytes))
            }
        }
        
        var prefix = xref.trailer.get('Info').get('Short Title - Prefix')
        var num = xref.trailer.get('Info').get('Short Title - Number')
        var formName = prefix + '' + num;
        //console.log(xfaDict);
        return {'formName': formName, 'xfaDict': xfaDict};
    });

    var pullBullets = getXFA.then(function(dat){
        //window.test1 = dat;
        
        var xfaDict = dat.xfaDict;
        var formName = dat.formName;
        
        
        var datasetXML = xfaDict['datasets'];
        datasetXML = datasetXML.replace(/&#xD;/g,'\n');
        
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(datasetXML, "text/xml");
        
        var bulletText = '';
        for (var tagName of Forms.all[formName]['fields']){
            var bulletTag = xmlDoc.querySelector(tagName);
            //bulletText = bulletText.replace(/&#xD;/g,'\n')
            //console.log(bulletTag);
            //console.log(bulletTag);
            //console.log(xfaDict['template']);
            bulletText += bulletTag.innerHTML + '\n';
        }
        return bulletText;
    });

    var getPageInfo = getXFA.then(function(dat){
        
        var xfaDict = dat.xfaDict;
        var formName = dat.formName;

        var templateXML = xfaDict['template'];
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(templateXML, "text/xml");
        //window.test2 = xmlDoc;

        
        var fonts = [];
        var fontSizes = []
        var widths = [];
        var i = 0;
        for (var tagName of Forms.all[formName]['fields']){
            var bulletTag  = xmlDoc.querySelector("field[name='" + tagName + "'");
            fonts[i] = bulletTag.querySelector('font').getAttribute('typeface');
            fontSizes[i] = bulletTag.querySelector('font').getAttribute('size');
            widths[i] = bulletTag.getAttribute('w');
            i += 1;
        }
        for (var font of fonts){
            if(font != fonts[0]){
                console.log('warning: not all grabbed sections have the same font type');
                break;
            }
        }
        for (var fontSize of fontSizes){
            if(fontSize != fontSizes[0]){
                console.log('warning: not all grabbed sections have the same font size');
                break;
            }
        }
        for (var width of widths){
            if(width != widths[0]){
                console.log('warning: not all grabbed sections have the same width');
                break;
            }
        }
        
        return {'font': fonts[0], 'fontSize':fontSizes[0], 'width':widths[0]}
        
        //accomplishmentsTag = templateXML.match(/name="specificAccomplishments"(.*?)<\/field/);
        //console.log(accomplishmentsTag)
    });
    return {'pullBullets': pullBullets, 'getPageInfo':getPageInfo};
}