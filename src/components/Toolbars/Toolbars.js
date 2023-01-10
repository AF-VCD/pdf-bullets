import { PureComponent, createRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { Forms } from "../../const/const.js";

const pdfjs = require("@ckhordiasma/pdfjs-dist");
const pdfjsWorker = require("@ckhordiasma/pdfjs-dist/build/pdf.worker.entry");
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

//PDF import
class ImportTools extends PureComponent {
  constructor(props) {
    super(props);
    this.fileInputRef = createRef();
    this.state = {
      type: "none",
      hovering: false,
    };
  }

  importFile = (e) => {
    if (!this.fileInputRef.current.value) {
      console.log("no file picked");
      return;
    } else {
      let callback = (file) => {
        console.log(file);
      };
      if (this.state.type === "PDF") {
        callback = this.getDataFromPDF;
      } else if (this.state.type === "JSON") {
        callback = this.getDataFromJSON;
      }
      //return Promise.resolve(this.fileInputRef.current.files[0]).then(callback).then(() => {
      //    this.fileInputRef.current.value = ''});
      callback(this.fileInputRef.current.files[0]);
      this.fileInputRef.current.value = "";
    }
  };
  inputClick = (importType) => {
    return () => {
      this.setState({
        type: importType,
      });
      this.fileInputRef.current.click();
    };
  };
  getDataFromPDF = (file) => {
    const { pullBullets, getPageInfo } = getBulletsFromPdf(file);
    //note: these promises are PDFJS promises, not ES promises

    //was not able to call this (this.props.onTextUpdate) inside the "then" scope, so I const'ed them out
    const textUpdater = this.props.onTextUpdate;
    const widthUpdater = this.props.onWidthUpdate;

    Promise.all([pullBullets, getPageInfo]).then(([bulletsHTML, pageData]) => {
      widthUpdater(parseFloat(pageData.width))();

      // This is needed to convert the bullets HTML into normal text. It gets rid of things like &amp;
      const bullets = new DOMParser().parseFromString(bulletsHTML, "text/html")
        .documentElement.textContent;
      textUpdater(bullets)();
    });
  };
  getDataFromJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);

      this.props.onJSONImport(data);
    };
    reader.readAsText(file);
  };

  hoverOut = () => {
    this.setState({ hovering: false });
  };
  toggleMenu = () => {
    const current = this.state.hovering;
    this.setState({ hovering: !current });
  };
  render() {
    const menuState = this.state.hovering ? "is-active" : "";
    return (
      <div className={"dropdown " + menuState}>
        <input
          type="file"
          onChange={this.importFile}
          style={{ display: "none" }}
          ref={this.fileInputRef}
        ></input>
        <div className="dropdown-trigger">
          <div className="buttons has-addons">
            <button className="button" onClick={this.inputClick("PDF")}>
              Import
            </button>
            <button
              className="button"
              onClick={this.toggleMenu}
              aria-haspopup="true"
              aria-controls="import-menu"
            >
              <span className="icon">
                <FontAwesomeIcon icon={faAngleDown} />
              </span>
            </button>
          </div>
        </div>
        <div
          className="dropdown-menu"
          id="import-menu"
          role="menu"
          onMouseLeave={this.hoverOut}
        >
          <div className="dropdown-content">
            <a
              href="?#"
              className="dropdown-item"
              onClick={this.inputClick("PDF")}
            >
              PDF
            </a>
            <a
              href="?#"
              className="dropdown-item"
              onClick={this.inputClick("JSON")}
            >
              JSON
            </a>
          </div>
        </div>
      </div>
    );
  }
}
// form width, space optimization, select text
class OutputTools extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const widthAWD = 202.321;
    const widthEPR = 202.321;
    const widthOPR = 201.041;
    return (
      <div className="field is-grouped">
        {/* if I want to group things together in a field, each subelement must have the control class name */}
        <div className="control field has-addons">
          <div className="control has-icons-right">
            <input
              className="input"
              id="widthInput"
              type="number"
              min="100"
              max="500"
              step=".001"
              value={this.props.width}
              onChange={this.props.onWidthChange}
            ></input>
            <span className="icon is-right">mm</span>
          </div>
          <div className="control buttons has-addons">
            <a
              className={
                "button is-primary " +
                (this.props.width === widthAWD ? "" : "is-outlined")
              }
              onClick={this.props.onWidthUpdate(widthAWD)}
            >
              AWD
            </a>
            <a
              className={
                "button is-success " +
                (this.props.width === widthEPR ? "" : "is-outlined")
              }
              onClick={this.props.onWidthUpdate(widthEPR)}
            >
              EPR
            </a>
            <a
              className={
                "button is-link " +
                (this.props.width === widthOPR ? "" : "is-outlined")
              }
              onClick={this.props.onWidthUpdate(widthOPR)}
            >
              OPR
            </a>
          </div>
        </div>

        <a
          className={
            "control button " +
            (this.props.enableOptim ? "is-dark" : "is-outlined")
          }
          onClick={this.props.onOptimChange}
          id="enableOptim"
        >
          Auto-Space
        </a>
        <a
          className={
            "control button " +
            (this.props.enableHighlight ? "is-success" : "is-outlined")
          }
          onClick={() => {this.props.onHighlightChange(); this.props.handleEnableHighlight()}}
          id="enableHighlight"
        >
          Show Duplicates
        </a>
      </div>
    );
  }
}
// normalize spaces
class InputTools extends PureComponent {
  render() {
    return (
      <button className="button" onClick={this.props.onTextNorm}>
        Normalize Spaces
      </button>
    );
  }
}
// saving settings
class SaveTools extends PureComponent {
  constructor(props) {
    super(props);
    this.exportRef = createRef();
    this.state = { hovering: false };
  }
  onSave = () => {
    const settings = this.props.onSave();
    //JSON stringifying an array for future growth
    const storedData = JSON.stringify([settings]);
    try {
      localStorage.setItem("bullet-settings", storedData);
      console.log(
        "saved settings/data to local storage with character length " +
          storedData.length
      );
    } catch (err) {
      if (err.name === "SecurityError") {
        alert(
          "Sorry, saving to cookies does not work using the file:// interface and/or your browser's privacy settings"
        );
      } else {
        throw err;
      }
    }
  };
  onExport = () => {
    const settings = this.props.onSave();
    //JSON stringifying an array for future growth
    const storedData = JSON.stringify([settings]);
    const dataURI =
      "data:application/JSON;charset=utf-8," + encodeURIComponent(storedData);
    this.exportRef.current.href = dataURI;
    this.exportRef.current.click();
    console.log(
      "exported settings/data to JSON file with character length " +
        storedData.length
    );
  };
  hoverOut = () => {
    this.setState({ hovering: false });
  };
  toggleMenu = () => {
    const current = this.state.hovering;
    this.setState({ hovering: !current });
  };
  render() {
    const menuState = this.state.hovering ? "is-active" : "";
    return (
      <div className={"dropdown " + menuState}>
        <div className="dropdown-trigger">
          <div className="buttons has-addons">
            <button className="button" onClick={this.onSave}>
              Save{" "}
            </button>
            <button
              className="button"
              aria-haspopup="true"
              aria-controls="save-menu"
            >
              <span className="icon" onClick={this.toggleMenu}>
                <FontAwesomeIcon icon={faAngleDown} />
              </span>
            </button>
          </div>
        </div>
        <div
          className="dropdown-menu"
          id="save-menu"
          role="menu"
          onMouseLeave={this.hoverOut}
        >
          <div className="dropdown-content">
            <a href="?#" className="dropdown-item" onClick={this.onSave}>
              Cookie
            </a>
            <a href="?#" className="dropdown-item" onClick={this.onExport}>
              JSON
            </a>
          </div>
        </div>

        <a
          href="?#"
          style={{ display: "none" }}
          download="settings.json"
          ref={this.exportRef}
        ></a>
      </div>
    );
  }
}
class Logo extends PureComponent {
  render() {
    return (
      <h1 className="title">
        <span className="logo">AF </span>
        <span className="logo">Bull</span>et
        <span className="logo"> Sh</span>aping &amp;
        <span className="logo"> i</span>teration
        <span className="logo"> t</span>ool
      </h1>
    );
  }
}
class ThesaurusTools extends PureComponent {
  render() {
    return (
      <a
        className="button"
        onClick={this.props.onHide}
        aria-haspopup="true"
        aria-controls="thesaurus-menu"
      >
        <span>Thesaurus</span>
        <span className="icon">
          <FontAwesomeIcon icon={faAngleDown} />
        </span>
      </a>
    );
  }
}
class DocumentTools extends PureComponent {
  render() {
    return (
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-start">
          <div className="navbar-item">
            <SaveTools onSave={this.props.onSave} />
          </div>
          <div className="navbar-item">
            <ImportTools
              onJSONImport={this.props.onJSONImport}
              onTextUpdate={this.props.onTextUpdate}
              onWidthUpdate={this.props.onWidthUpdate}
            />
          </div>
          <div className="navbar-item">
            <OutputTools
              enableOptim={this.props.enableOptim}
              onOptimChange={this.props.onOptimChange}
              enableHighlight={this.props.enableHighlight}
              onHighlightChange={this.props.onHighlightChange}
              handleEnableHighlight={this.props.handleEnableHighlight}
              width={this.props.width}
              onWidthChange={this.props.onWidthChange}
              onWidthUpdate={this.props.onWidthUpdate}
            />
          </div>
          <div className="navbar-item">
            <InputTools onTextNorm={this.props.onTextNorm} />
          </div>
          <div className="navbar-item">
            <ThesaurusTools onHide={this.props.onThesaurusHide} />
          </div>
        </div>
      </nav>
    );
  }
}

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

export { Logo, DocumentTools };
