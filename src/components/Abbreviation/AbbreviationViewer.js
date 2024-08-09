import { useRef, useState, useEffect } from "react";

import AbbreviationTable from "./AbbreviationTable.js";
import { getDataFromXLS, exportToXLS, importSampleAbbrs } from "./utils";

export function AbbreviationToolbar({ data, setData, ...props }) {
  const fileInputRef = useRef();
  const [pickedFile, setPickedFile] = useState({
    name: "",
    size: 0,
    lastModified: 0,
  });

  useEffect(() => {
    if (pickedFile.name !== "") {
      //console.log("processing new abbr file");
      getDataFromXLS(pickedFile).then((data) => setData(data));
    }
  }, [pickedFile]);

  function importAbbrs(e) {
    const newFile = fileInputRef.current.files[0];
    if (newFile === undefined) {
      //console.log("No file was picked");
      return;
    } else if (
      pickedFile.lastModified == newFile.lastModified &&
      pickedFile.name === newFile.name &&
      pickedFile.size === newFile.size
    ) {
      //console.log("same file picked");
      return;
    } else {
      setPickedFile(newFile);
    }
  }

  return (
    <div className="toolbox">
      <input
        type="file"
        data-testid="uploader"
        onChange={importAbbrs}
        ref={fileInputRef}
        style={{ display: "none" }}
      ></input>
      <button
        className="button"
        onClick={() => {
          fileInputRef.current.click();
        }}
      >
        Import Abbrs
      </button>
      <button
        className="button"
        onClick={() => exportToXLS(data, "abbrs.xlsx")}
      >
        Export Abbrs
      </button>
      <button
        className="button"
        onClick={() => {
          if (
            window.confirm(
              "Are you sure you want to remove all existing acronyms and replace with a common list?"
            )
          ) {
            importSampleAbbrs()
              .then((file) => getDataFromXLS(file))
              .then((data) => setData(data));
          }
        }}
      >
        Load Common Abbrs
      </button>
    </div>
  );
}

function AbbreviationViewer({ data, setData }) {
  return (
    <div>
      <AbbreviationToolbar setData={setData} data={data} />
      <AbbreviationTable data={data} setData={setData} />
    </div>
  );
}

export default AbbreviationViewer;
