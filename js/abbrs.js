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
            this.getDataFromXLS(this.fileInputRef.current.files[0]);
            this.fileInputRef.current.value = '';
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
            <div className='toolbox'>
                <input type="file" onChange={this.importAbbrs} ref={this.fileInputRef} style={{display:"none"}}></input>
                <button className="button" onClick={this.inputClick}>Import Abbrs</button>
                <button className="button" onClick={this.exportToXLS}>Export Abbrs</button>
                <button className="button" onClick={() => {
                    if(confirm("Are you sure you want to remove all existing acronyms and replace with a common list?")){
                        this.importSampleAbbrs();
                    }
                }}>Load Common Abbrs</button>
            </div>
        );
    }
}
class AbbrsViewer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.tableRef = React.createRef();
        if(checkAbbrs) console.log(this.props)

    }

    handleAbbrChange = (type) => {
        if( checkAbbrs) console.log(type)
        return (e)=>{
            //this.props.onAbbrChange(e);
            if( checkAbbrs) console.log(e)
            if(checkAbbrs) console.log(this.props)
            if(checkAbbrs) console.log(this.state)
            if(checkAbbrs) console.log(this.tableRef.current)

            //if(checkAbbrs) console.log(new RegExp("(\\b)("+Object.keys(this.state.abbrDict).join("|")+")(\\b|$|\\$)",'g'))

            this.props.onAbbrChange(this.tableRef);   
        }
    }
    reloadData = (rows)=>{
        this.tableRef.current.hotInstance.updateSettings({data:[]});
        this.tableRef.current.hotInstance.loadData(rows);
    }
    getData = ()=>{
        return this.tableRef.current.hotInstance.getData();
    }
    render() {
        if( checkAbbrs) console.log(this.props.abbrData)
        return (
            <div>
                <AbbrTools updater={this.reloadData} getter={this.getData}/>
                <HotTable settings={this.props.settings}  data={this.props.abbrData}
                ref={this.tableRef} 
                afterChange={this.handleAbbrChange('afterchange')}
                afterPaste={this.handleAbbrChange('afterpaste')}
                afterRemoveRow={this.handleAbbrChange('afterremoverow')}
                afterUpdateSettings={this.handleAbbrChange('afterupdatesettings')}/>
            </div>
        );
    }
}

