import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import ImportTools from "./ImportTools";
import SaveTools from "./SaveTools";
// form width, space optimization, select text
function OutputTools({
  onOptimChange,
  enableOptim,
  onWidthUpdate,
  width,
  onHighlightChange,
  handleEnableHighlight,
  enableHighlight,
}) {
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
      <a
        className={
          "control button is-dark" +
          (enableHighlight ? "is-success" : "is-outlined")
        }
        onClick={() => {
          onHighlightChange();
          handleEnableHighlight();
        }}
        id="enableHighlight"
      >
        Show Duplicates
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

function ThemeSelector() {
  const [theme, setTheme] = React.useState(
    () => localStorage.getItem("theme") || "system"
  );

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme"); // defer to prefers-color-scheme
      localStorage.removeItem("theme");
    } else {
      root.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  return (
    <div className="field has-addons is-align-items-center">
      <span className="control">
        <span className="button is-static">Theme</span>
      </span>
      <span className="control">
        <div className="select">
          <select
            aria-label="Theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </span>
    </div>
  );
}

function Logo() {
  return <h1 className="title">AF Bullet Shaping &amp; Iteration Tool</h1>;
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
    <nav
      className="navbar is-wrap"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-start">
        <div className="navbar-item">
          <SaveTools getSavedSettings={props.getSavedSettings} />
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
            onHighlightChange={props.onHighlightChange}
            handleEnableHighlight={props.handleEnableHighlight}
            enableHighlight={props.enableHighlight}
          />
        </div>
        <div className="navbar-item">
          <InputTools onTextNorm={props.onTextNorm} />
        </div>
        <div className="navbar-item">
          <ThesaurusTools onHide={props.onThesaurusHide} />
        </div>
        <div className="navbar-item">
          <ThemeSelector />
        </div>
      </div>
    </nav>
  );
}

export { Logo, DocumentTools };
