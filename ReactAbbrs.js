//import React from 'react';
//import ReactDOM from 'react-dom';
//import { HotTable } from '@handsontable/react';
//import Handsontable from 'handsontable';

class AbbrTools extends React.PureComponent{
    constructor(props){
        super(props);
        this.fileInputRef = React.createRef();
    }
    importSampleAbbrs = ()=>{
        return new Promise((res,rej)=>{
            const xhttp = new XMLHttpRequest();
            xhttp.responseType = 'blob';
            xhttp.onload = ()=>{
                res(xhttp.response);
            }
            xhttp.open('GET','./abbrs.xlsx',true);
            xhttp.send();
        }).then(this.getDataFromXLS);        
    }
    importAbbrs = (e) => {
        
        if(!this.fileInputRef.current.value){
            clog('no file picked');
            return;
        }else{
            return Promise.resolve(this.fileInputRef.current.files[0]).then(this.getDataFromXLS);
        }
        
    }
    getDataFromXLS = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data,{
                type:'binary',
                raw:true,
            });
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]],
                {'header':['enabled','value','abbr']});
            this.props.updater(rows)
        };
        reader.readAsBinaryString(file)
    }
    exportToXLS = ()=>{
        const wb = XLSX.utils.book_new();
        const sht  = XLSX.utils.aoa_to_sheet(this.props.getter());
        XLSX.utils.book_append_sheet(wb,sht,'abbrs')
        XLSX.writeFile(wb,'abbrs.xlsx');
    }
    inputClick = () => {
        this.fileInputRef.current.click();
    }
    render(){

        return (
            <div>
                <input type="file" onChange={this.importAbbrs} ref={this.fileInputRef} style={{display:"none"}}></input>
                <button onClick={this.inputClick}>Import Abbrs</button>
                <button onClick={this.exportToXLS}>Export Abbrs</button>
                <button onClick={() => {
                    if(confirm("Are you sure you want to remove all existing acronyms and replace with a sample list?")){
                        this.importSampleAbbrs();
                    }
                }}>Load Sample Abbrs</button>
            </div>
        );
    }
}
class AbbrsViewer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.tableRef = React.createRef();
        clog(this.props, checkAbbrs)
        this.state = {
            tableData: this.props.initialData,
            abbrDict: {},
        }
    }
    // var tableUpdater = function(){
    //     updateAbbrDict();
    //     updateProcessedBullets();
    //     getThesaurus();
    //     //console.log('change occurred')
    // };
    

    handleAbbrChange = ()=>{
        //this.props.onAbbrChange(e);
        clog(this.props,checkAbbrs)
        clog(this.state,checkAbbrs)
        clog(this.tableRef.current,checkAbbrs)

        if(this.tableRef.current == null ){return}
        const abbrTable = this.tableRef.current.hotInstance;
        const newAbbrDict = {};

        for (var i = 0; i < abbrTable.countRows();i++){
            let fullWord = String(abbrTable.getDataAtRowProp(i,'value')).replace(/\s/g,' ');
            let abbr = abbrTable.getDataAtRowProp(i,'abbr');
            //console.log('abbr: ' + abbr)
            let enabled = abbrTable.getDataAtRowProp(i,'enabled')
            newAbbrDict[fullWord] = newAbbrDict[fullWord] || [];
            
            if(enabled){
                newAbbrDict[fullWord].enabled = newAbbrDict[fullWord].enabled || [];
                newAbbrDict[fullWord].enabled.push(abbr)
            }else{
                newAbbrDict[fullWord].disabled = newAbbrDict[fullWord].disabled || [];
                newAbbrDict[fullWord].disabled.push(abbr)
            }

        }
        this.setState((state)=>{
            state.abbrDict = newAbbrDict;
            return state;
        })
        //clog(new RegExp("(\\b)("+Object.keys(this.state.abbrDict).join("|")+")(\\b|$|\\$)",'g'),checkAbbrs)

        this.props.onAbbrChange(this.state.abbrDict);
        
    }
    reloadData = (rows)=>{
        this.tableRef.current.hotInstance.updateSettings({data:[]});
        this.tableRef.current.hotInstance.loadData(rows);
    }
    getData = ()=>{
        return this.tableRef.current.hotInstance.getData();
    }
    render() {

        return (
            <div>
                <AbbrTools updater={this.reloadData} getter={this.getData}/>
                <HotTable settings={this.props.settings}  data={this.state.tableData}
                ref={this.tableRef} 
                afterChange={this.handleAbbrChange}
                afterPaste={this.handleAbbrChange}
                afterRemoveRow={this.handleAbbrChange}
                afterUpdateSettings={this.handleAbbrChange}/>
            </div>
        );
    }
}

