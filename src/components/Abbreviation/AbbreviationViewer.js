import {createRef} from "react"
import XLSX from "xlsx"
import SampleAbbrFile from '../../static/abbrs.xlsx'
import AbbreviationTable from './AbbreviationTable.js'


export const importSampleAbbrs = (callback)=>{
    return new Promise((res) => {
        const xhttp = new XMLHttpRequest();
        xhttp.responseType = 'blob';
        xhttp.onload = () => {
            res(xhttp.response);
        }
        xhttp.open('GET', SampleAbbrFile, true);
        xhttp.send();
    }).then(callback);
}

export const getDataFromXLS = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, {
            type: 'binary',
            raw: true,
        });
        const rows = XLSX.utils.sheet_to_json(
            workbook.Sheets[workbook.SheetNames[0]],
            { 'header': ['enabled', 'value', 'abbr'] })
            .map(({enabled, value, abbr})=>{
                    return {enabled, value, abbr}
            });
        
        // checks first row, enabled value and see if it matches header text
        // normally enabled is a boolean.
        if((rows[0].enabled.toString()).match(/enabled/i)){
            callback(rows.slice(1));
        } else{
            callback(rows);
        }
        
    };
    reader.readAsBinaryString(file)
}

export const exportToXLS = (data) => {
    const wb = XLSX.utils.book_new();
    const sht = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, sht, 'abbrs')
    XLSX.writeFile(wb, 'abbrs.xlsx');
}

function AbbrToolbar({ data, setData, ...props}) {

    const fileInputRef = createRef();

    function importAbbrs(e) {

        if (!fileInputRef.current.value) {
            console.log('no file picked');
            return;
        } else {
            getDataFromXLS(fileInputRef.current.files[0]);
            fileInputRef.current.value = '';
        }

    }
    

    return (
        <div className='toolbox'>
            <input type="file" onChange={importAbbrs} ref={fileInputRef} style={{ display: "none" }}></input>
            <button className="button" onClick={()=>fileInputRef.current.click()}>Import Abbrs</button>
            <button className="button" onClick={()=>exportToXLS(data)}>Export Abbrs</button>
            <button className="button" onClick={() => {
                if (window.confirm("Are you sure you want to remove all existing acronyms and replace with a common list?")) {
                    importSampleAbbrs((file)=> getDataFromXLS(file, setData));
                }
            }}>Load Common Abbrs</button>
        </div>
    );

}

function AbbreviationViewer({ data, setData }) {
    return (
        <div>
            <AbbrToolbar setData={setData} data={data} />
            <AbbreviationTable data={data} setData={setData} />
        </div>
    );
}

export default AbbreviationViewer;
