import { getDataFromXLS, exportToXLS, importSampleAbbrs } from "./utils";

import { readFileSync, unlink } from "fs";

test("loads file correctly with no header", () => {
  const sampleBlob = new Blob([
    readFileSync(__dirname + "/../../static/test-abbrs/sample-no-header.xlsx"),
  ]);

  return getDataFromXLS(sampleBlob).then((data) => {
    expect(Object.keys(data[0]).length).toEqual(3);
    expect(data[0].value).toEqual(1000);
    expect(data.length).toEqual(334);
  });
});

test("loads file correctly with header", () => {
  const sampleBlob = new Blob([
    readFileSync(
      __dirname + "/../../static/test-abbrs/sample-with-header.xlsx"
    ),
  ]);

  return getDataFromXLS(sampleBlob).then((data) => {
    expect(Object.keys(data[0]).length).toEqual(3);
    expect(data[0].value).toEqual(1000);
    expect(data.length).toEqual(334);
  });
});

test("an exported xlsx file imports correctly", () => {
  const data = [{ enabled: true, value: "asdf", abbr: "af" }];
  const dest = __dirname + "/../../static/test-abbrs/sample-generated.xlsx";
  unlink(dest, (err) => {
    if (err && err.errno !== -4058) throw err; //ignore file not found error
  });
  exportToXLS(data, dest);

  const testBlob = new Blob([readFileSync(dest)]);
  return getDataFromXLS(testBlob).then((dataIn) => {
    expect(dataIn).toEqual(data);
  });
});
