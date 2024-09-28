import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

// saving settings
export default function SaveTools({ getSavedSettings }) {
  const [hovering, setHovering] = useState(false);
  const exportRef = useRef();
  const menuState = hovering ? "is-active" : "";
  const saveSettings = () => {
    const settings = getSavedSettings();
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
  const exportSettings = () => {
    const settings = getSavedSettings();
    //JSON stringifying an array for future growth
    const storedData = JSON.stringify([settings]);
    const dataURI =
      "data:application/JSON;charset=utf-8," + encodeURIComponent(storedData);
    exportRef.current.href = dataURI;
    exportRef.current.click();
    console.log(
      "exported settings/data to JSON file with character length " +
        storedData.length
    );
  };

  return (
    <div className={"dropdown " + menuState}>
      <div className="dropdown-trigger">
        <div className="buttons has-addons">
          <button className="button" onClick={saveSettings}>
            Save{" "}
          </button>
          <button
            className="button"
            aria-haspopup="true"
            aria-controls="save-menu"
          >
            <span className="icon" onClick={() => setHovering(!hovering)}>
              <FontAwesomeIcon icon={faAngleDown} />
            </span>
          </button>
        </div>
      </div>
      <div
        className="dropdown-menu"
        id="save-menu"
        role="menu"
        onMouseLeave={() => setHovering(false)}
      >
        <div className="dropdown-content">
          <a href="?#" className="dropdown-item" onClick={saveSettings}>
            Cookie
          </a>
          <a href="?#" className="dropdown-item" onClick={exportSettings}>
            JSON
          </a>
        </div>
      </div>

      <a
        href="?#"
        style={{ display: "none" }}
        download="settings.json"
        ref={exportRef}
      ></a>
    </div>
  );
}
