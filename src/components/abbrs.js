//import React from 'react';
//import ReactDOM from 'react-dom';
//import { HotTable } from '@handsontable/react';
//import Handsontable from 'handsontable';

import React from "react"
import XLSX from "xlsx"
import SampleAbbrFile from '../static/abbrs.xlsx'
import AbbrTable from './abbrtable.js'


function AbbrTools({ data, setData, ...props}) {

    const fileInputRef = React.createRef();
    function importSampleAbbrs() {
        return new Promise((res) => {
            const xhttp = new XMLHttpRequest();
            xhttp.responseType = 'blob';
            xhttp.onload = () => {
                res(xhttp.response);
            }
            xhttp.open('GET', SampleAbbrFile, true);
            xhttp.send();
        }).then(getDataFromXLS);
    }
    function importAbbrs(e) {

        if (!fileInputRef.current.value) {
            console.log('no file picked');
            return;
        } else {
            getDataFromXLS(fileInputRef.current.files[0]);
            fileInputRef.current.value = '';
        }

    }
    function getDataFromXLS(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, {
                type: 'binary',
                raw: true,
            });
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],
                { 'header': ['enabled', 'value', 'abbr'] });
            props.updater(rows)
        };
        reader.readAsBinaryString(file)
    }
    function exportToXLS() {
        const wb = XLSX.utils.book_new();
        const sht = XLSX.utils.aoa_to_sheet(props.getter());
        XLSX.utils.book_append_sheet(wb, sht, 'abbrs')
        XLSX.writeFile(wb, 'abbrs.xlsx');
    }
    function inputClick() {
        fileInputRef.current.click();
    }


    return (
        <div className='toolbox'>
            <input type="file" onChange={importAbbrs} ref={fileInputRef} style={{ display: "none" }}></input>
            <button className="button" onClick={inputClick}>Import Abbrs</button>
            <button className="button" onClick={exportToXLS}>Export Abbrs</button>
            <button className="button" onClick={() => {
                if (window.confirm("Are you sure you want to remove all existing acronyms and replace with a common list?")) {
                    importSampleAbbrs();
                }
            }}>Load Common Abbrs</button>
        </div>
    );

}

function AbbrsViewer({ data, setData }) {
    console.log(data);
    return (
        <div>
            <AbbrTools setData={setData} data={data} />
            <AbbrTable data={data} setData={setData} />
        </div>
    );
}

export default AbbrsViewer;