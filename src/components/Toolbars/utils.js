import { Forms } from "../../const/const.js";

const pdfjs = require("@ckhordiasma/pdfjs-dist");
const pdfjsWorker = require("@ckhordiasma/pdfjs-dist/build/pdf.worker.entry");
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function getDataFromPDF(file) {
  return Promise.resolve(getBulletsFromPdf(file)).then(
    ({ bulletText, pageInfo }) => {
      // This is needed to convert the bullets HTML into normal text. It fixes things like &amp;
      const bullets = new DOMParser().parseFromString(bulletText, "text/html")
        .documentElement.textContent;

      return { width: parseFloat(pageInfo.width), bullets };
    }
  );
}

export function getDataFromJSON(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      res(data);
    };
    reader.onerror = rej;
    reader.readAsText(file);
  });
}

// Extracting bullets from one of the XML stores in a form pdf.
// because the data format is XML, Bullets will be HTML-escaped,
//  with things like &amp;
export function bulletsFromXML(xml, formType) {
  const datasetXML = xml.replace(/&#xD;/g, "\n");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(datasetXML, "text/xml");

  let bulletText = "";
  for (let tagName of Forms.all[formType]["fields"]) {
    const bulletTag = xmlDoc.querySelector(tagName);
    bulletText += bulletTag.innerHTML + "\n";
  }
  return bulletText;
}
// Grabs font and page width information from one of the XML stores in a form pdf.
// It does some rudimentary error checking to make sure that all the relevant fields in the
//   pdf have the same font size, text fields width, and font face.
export function infoFromXML(xml, formType) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, "text/xml");

  let fonts = [];
  let fontSizes = [];
  let widths = [];
  let i = 0;
  for (let tagName of Forms.all[formType]["fields"]) {
    const bulletTag = xmlDoc.querySelector("field[name='" + tagName + "'");
    fonts[i] = bulletTag.querySelector("font").getAttribute("typeface");
    fontSizes[i] = bulletTag.querySelector("font").getAttribute("size");
    widths[i] = bulletTag.getAttribute("w");
    i += 1;
  }
  for (let font of fonts) {
    if (font !== fonts[0]) {
      console.log("warning: not all grabbed sections have the same font type");
      break;
    }
  }
  for (let fontSize of fontSizes) {
    if (fontSize !== fontSizes[0]) {
      console.log("warning: not all grabbed sections have the same font size");
      break;
    }
  }
  for (let width of widths) {
    if (width !== widths[0]) {
      console.log("warning: not all grabbed sections have the same width");
      break;
    }
  }

  return { font: fonts[0], fontSize: fontSizes[0], width: widths[0] };
}

export async function getBulletsFromPdf(filedata) {
  const pdf = await filedata.arrayBuffer().then((buffer) => {
    const uint8Array = new Uint8Array(buffer);

    return pdfjs.getDocument({ data: uint8Array }).promise;
  });

  const xfaDict = await pdf.getXFA();

  const formType = await pdf.getMetadata().then(function (result) {
    const prefix = result.info.Custom["Short Title - Prefix"];
    const num = result.info.Custom["Short Title - Number"];
    return prefix + "" + num;
  });

  const bulletText = bulletsFromXML(xfaDict["datasets"], formType);
  const pageInfo = infoFromXML(xfaDict["template"], formType);

  //accomplishmentsTag = templateXML.match(/name="specificAccomplishments"(.*?)<\/field/);
  //console.log(accomplishmentsTag)

  return { bulletText, pageInfo };
}
