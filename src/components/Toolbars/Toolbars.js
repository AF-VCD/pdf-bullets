import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { getDataFromPDF, getDataFromJSON } from "./utils.js";

//PDF import
function ImportTools({ onTextUpdate, onWidthUpdate, onJSONImport }) {
  const fileInputRef = useRef();
  const [type, setType] = useState("");
  const [hovering, setHovering] = useState(false);

  const importFile = (e) => {
    if (!fileInputRef.current.value) {
      console.log("no file picked");
      return;
    } else {
      const file = fileInputRef.current.files[0];
      if (type === "pdf") {
        getDataFromPDF(file).then(({ width, bullets }) => {
          onWidthUpdate(width);
          onTextUpdate(bullets);
        });
      } else if (type === "json") {
        getDataFromJSON(file).then((data) => onJSONImport(data));
      }

      fileInputRef.current.value = "";
    }
  };

  const menuState = hovering ? "is-active" : "";

  return (
    <div className={"dropdown " + menuState}>
      <input
        type="file"
        onChange={importFile}
        style={{ display: "none" }}
        ref={fileInputRef}
      ></input>
      <div className="dropdown-trigger">
        <div className="buttons has-addons">
          <button
            className="button"
            onClick={() => {
              setType("pdf");
              fileInputRef.current.click();
            }}
          >
            Import
          </button>
          <button
            className="button"
            onClick={() => setHovering(!hovering)}
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
        onMouseLeave={() => setHovering(false)}
      >
        <div className="dropdown-content">
          <a
            href="?#"
            className="dropdown-item"
            onClick={() => {
              setType("pdf");
              fileInputRef.current.click();
            }}
          >
            PDF
          </a>
          <a
            href="?#"
            className="dropdown-item"
            onClick={() => {
              setType("json");
              fileInputRef.current.click();
            }}
          >
            JSON
          </a>
        </div>
      </div>
    </div>
  );
}
// form width, space optimization, select text
function OutputTools({ onOptimChange, enableOptim, onWidthUpdate, width }) {
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
            value={width}
            onChange={(e) => onWidthUpdate(parseFloat(e.target.value))}
          ></input>
          <span className="icon is-right">mm</span>
        </div>
        <div className="control buttons has-addons">
          <a
            className={
              "button is-primary " + (width === widthAWD ? "" : "is-outlined")
            }
            onClick={() => onWidthUpdate(widthAWD)}
          >
            AWD
          </a>
          <a
            className={
              "button is-success " + (width === widthEPR ? "" : "is-outlined")
            }
            onClick={() => onWidthUpdate(widthEPR)}
          >
            EPR
          </a>
          <a
            className={
              "button is-link " + (width === widthOPR ? "" : "is-outlined")
            }
            onClick={() => onWidthUpdate(widthOPR)}
          >
            OPR
          </a>
        </div>
      </div>

      <a
        className={
          "control button is-dark" + (enableOptim ? "" : "is-outlined")
        }
        onClick={onOptimChange}
        id="enableOptim"
      >
        Auto-Space
      </a>
    </div>
  );
}
// normalize spaces
function InputTools({ onTextNorm }) {
  return (
    <button className="button" onClick={onTextNorm}>
      Renormalize Input Spacing
    </button>
  );
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
function Logo() {
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
function ThesaurusTools({ onHide }) {
  return (
    <a
      className="button"
      onClick={onHide}
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
function DocumentTools(props) {
  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-start">
        <div className="navbar-item">
          <SaveTools onSave={props.onSave} />
        </div>
        <div className="navbar-item">
          <ImportTools
            onJSONImport={props.onJSONImport}
            onTextUpdate={props.onTextUpdate}
            onWidthUpdate={props.onWidthUpdate}
          />
        </div>
        <div className="navbar-item">
          <OutputTools
            enableOptim={props.enableOptim}
            onOptimChange={props.onOptimChange}
            width={props.width}
            onWidthUpdate={props.onWidthUpdate}
          />
        </div>
        <div className="navbar-item">
          <InputTools onTextNorm={props.onTextNorm} />
        </div>
        <div className="navbar-item">
          <ThesaurusTools onHide={props.onThesaurusHide} />
        </div>
      </div>
    </nav>
  );
}

export { Logo, DocumentTools };
