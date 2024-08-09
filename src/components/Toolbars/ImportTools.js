import { getDataFromPDF, getDataFromJSON } from "./utils.js";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

//PDF import
export default function ImportTools({
  onTextUpdate,
  onWidthUpdate,
  onJSONImport,
}) {
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
