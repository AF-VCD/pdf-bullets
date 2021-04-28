import { Forms } from "../../const/const.js";

export const getDataFromPDF = (file) => {
  const { pullBullets, getPageInfo } = getBulletsFromPdf(file);

  return Promise.all([pullBullets, getPageInfo]).then(
    ([bulletsHTML, pageData]) => {
      // This is needed to convert the bullets HTML into normal text. It fixes things like &amp;
      const bullets = new DOMParser().parseFromString(bulletsHTML, "text/html")
        .documentElement.textContent;

      return { width: parseFloat(pageData.width), bullets };
    }
  );
};

export const getDataFromJSON = (file) => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      res(data);
    };
    reader.onerror = rej;
    reader.readAsText(file);
  });
};

const pdfjs = require("@ckhordiasma/pdfjs-dist");
const pdfjsWorker = require("@ckhordiasma/pdfjs-dist/build/pdf.worker.entry");
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function getBulletsFromPdf(filedata) {
  const pdfSetup = filedata.arrayBuffer().then(function (buffer) {
    const uint8Array = new Uint8Array(buffer);

    return pdfjs.getDocument({ data: uint8Array }).promise;
  });

  const getXFA = pdfSetup.then(function (pdf) {
    return pdf.getXFA();
  });

  const getFormName = pdfSetup.then(function (pdf) {
    return pdf.getMetadata().then(function (result) {
      const prefix = result.info.Custom["Short Title - Prefix"];
      const num = result.info.Custom["Short Title - Number"];
      return prefix + "" + num;
    });
  });
  const getAllData = Promise.all([getFormName, getXFA]);
  const pullBullets = getAllData.then(function (results) {
    const formName = results[0];
    const xfaDict = results[1];

    let datasetXML = xfaDict["datasets"];
    datasetXML = datasetXML.replace(/&#xD;/g, "\n");

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(datasetXML, "text/xml");

    let bulletText = "";
    for (let tagName of Forms.all[formName]["fields"]) {
      const bulletTag = xmlDoc.querySelector(tagName);
      bulletText += bulletTag.innerHTML + "\n";
    }
    return bulletText;
  });

  const getPageInfo = getAllData.then(function (results) {
    const formName = results[0];
    const xfaDict = results[1];

    const templateXML = xfaDict["template"];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(templateXML, "text/xml");

    let fonts = [];
    let fontSizes = [];
    let widths = [];
    let i = 0;
    for (let tagName of Forms.all[formName]["fields"]) {
      const bulletTag = xmlDoc.querySelector("field[name='" + tagName + "'");
      fonts[i] = bulletTag.querySelector("font").getAttribute("typeface");
      fontSizes[i] = bulletTag.querySelector("font").getAttribute("size");
      widths[i] = bulletTag.getAttribute("w");
      i += 1;
    }
    for (let font of fonts) {
      if (font !== fonts[0]) {
        console.log(
          "warning: not all grabbed sections have the same font type"
        );
        break;
      }
    }
    for (let fontSize of fontSizes) {
      if (fontSize !== fontSizes[0]) {
        console.log(
          "warning: not all grabbed sections have the same font size"
        );
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

    //accomplishmentsTag = templateXML.match(/name="specificAccomplishments"(.*?)<\/field/);
    //console.log(accomplishmentsTag)
  });
  return { pullBullets, getPageInfo };
}
