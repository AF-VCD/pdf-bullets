// could not do a static class property because of MS edge
const Forms  = { 
 all : {
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
};
function getBulletsFromPdf(filedata){

    
    const pdfSetup = filedata.arrayBuffer().then(function(buffer){
        const uint8Array = new Uint8Array(buffer);
        const pdf = new PDFDocument(null, uint8Array);
        pdf.parseStartXRef();
        pdf.parse();
        return pdf;
    });

    const getXFA = pdfSetup.then(function(pdf){
        const xref = pdf.xref;
        //window.test1 = pdf;
        const xfa = pdf.acroForm.get('XFA');
        let xfaDict = [];
        for (let i = 0; i < xfa.length;i++){
            if(i % 2 == 0 ){                
                const bytes = xref.fetch(xfa[i+1]).getBytes()

                xfaDict[xfa[i]] = new TextDecoder().decode(bytes)
                //console.log(new TextDecoder().decode(bytes))
            }
        }
        
        const prefix = xref.trailer.get('Info').get('Short Title - Prefix')
        const num = xref.trailer.get('Info').get('Short Title - Number')
        const formName = prefix + '' + num;
        //console.log(xfaDict);
        return {'formName': formName, 'xfaDict': xfaDict};
    });

    const pullBullets = getXFA.then(function(dat){
        //window.test1 = dat;
        
        const xfaDict = dat.xfaDict;
        const formName = dat.formName;
        
        
        let datasetXML = xfaDict['datasets'];
        datasetXML = datasetXML.replace(/&#xD;/g,'\n');
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(datasetXML, "text/xml");
        
        let bulletText = '';
        for (let tagName of Forms.all[formName]['fields']){
            const bulletTag = xmlDoc.querySelector(tagName);
            //bulletText = bulletText.replace(/&#xD;/g,'\n')
            //console.log(bulletTag);
            //console.log(bulletTag);
            //console.log(xfaDict['template']);
            bulletText += bulletTag.innerHTML + '\n';
        }
        return bulletText;
    });

    const getPageInfo = getXFA.then(function(dat){
        
        const xfaDict = dat.xfaDict;
        const formName = dat.formName;

        const templateXML = xfaDict['template'];
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(templateXML, "text/xml");
        //window.test2 = xmlDoc;

        
        let fonts = [];
        let fontSizes = []
        let widths = [];
        let i = 0;
        for (let tagName of Forms.all[formName]['fields']){
            const bulletTag  = xmlDoc.querySelector("field[name='" + tagName + "'");
            fonts[i] = bulletTag.querySelector('font').getAttribute('typeface');
            fontSizes[i] = bulletTag.querySelector('font').getAttribute('size');
            widths[i] = bulletTag.getAttribute('w');
            i += 1;
        }
        for (let font of fonts){
            if(font != fonts[0]){
                console.log('warning: not all grabbed sections have the same font type');
                break;
            }
        }
        for (let fontSize of fontSizes){
            if(fontSize != fontSizes[0]){
                console.log('warning: not all grabbed sections have the same font size');
                break;
            }
        }
        for (let width of widths){
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