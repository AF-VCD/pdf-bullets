import * as XLSX from "xlsx";
import SampleAbbrFile from "../../static/abbrs.xlsx";

export const getDataFromXLS = (file) => {
  return new Promise((res) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, {
        type: "binary",
        raw: true,
      });
      const rows = XLSX.utils
        .sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
          header: ["enabled", "value", "abbr"],
        })
        .map(({ enabled, value, abbr }) => {
          return { enabled, value, abbr };
        });

      // checks first row, enabled value and see if it matches header text
      // normally enabled is a boolean.
      if (rows[0].enabled.toString().match(/enabled/i)) {
        res(rows.slice(1));
      } else {
        res(rows);
      }
    };
    reader.readAsBinaryString(file);
  });
};

export const exportToXLS = (data, filename) => {
  const wb = XLSX.utils.book_new();
  const sht = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, sht, "abbrs");
  XLSX.writeFile(wb, filename);
};

export const importSampleAbbrs = () => {
  return fetch(SampleAbbrFile).then((response) => response.blob()); // This is a PROMISE
};
