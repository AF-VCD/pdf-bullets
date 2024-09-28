import { useRef, useState} from "react";


import { HotTable } from "@handsontable/react";
import "handsontable/dist/handsontable.full.css";
import { registerAllModules } from 'handsontable/registry';
registerAllModules();


const tableSettings = {
  columns: [
    {
      data: "enabled",
      type: "checkbox",
      disableVisualSelection: true,
      width: 20,
    },
    {
      data: "value",
      type: "text",
    },
    {
      data: "abbr",
      type: "text",
    },
  ],
  stretchH: "all",
  width: 500,
  autoWrapRow: true,
  height: 500,
  maxRows: Infinity,
  manualRowResize: true,
  manualColumnResize: true,
  rowHeaders: true,
  colHeaders: ["Enabled", "Word", "Abbreviation"],
  trimWhitespace: false,
  enterBeginsEditing: false,
  manualRowMove: true,
  manualColumnMove: true,
  columnSorting: {
    indicator: true,
  },
  autoColumnSize: false,
  minRows: 15,
  contextMenu: true,
  licenseKey: "non-commercial-and-evaluation",
};

function AbbreviationTable({ data, setData }) {
  const tableRef = useRef(null);
  const update = (changes, source) => {
    //console.log({source, payload, tableRef: tableRef.current , data})
    // console.log("update source: ", source);
    // console.log({source, changes})
    const newData = [...data] 
    changes.forEach(([row, col, oldVal, newVal]) => {
      newData[row][col] = newVal
    })
    setData(newData);
    return false
  };
  const removeRow = (index, amount, rows, source) => {
    const newData = []
    for (let i = 0; i < data.length; i++) {
      let keep = true
      for (let j = 0; j < rows.length; j++) {
        if (rows[j] == i) {
          keep = false
        }
      }
      if (keep) {
        newData.push(data[i])
      }
    }
    setData(newData)
    const colSort = tableRef.current.hotInstance.getPlugin('columnSorting')
    const sortConfig = colSort.getSortConfig()
    colSort.sort(sortConfig)
    return false
  }
  return (
    <HotTable
      {...tableSettings}
      data={data}
      ref={tableRef}
      beforeChange={update}
      beforeRemoveRow={removeRow}
    />
  );
}

export default AbbreviationTable;
