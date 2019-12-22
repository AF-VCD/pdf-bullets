//import React from 'react';
//import ReactDOM from 'react-dom';
//import { HotTable } from '@handsontable/react';
//import Handsontable from 'handsontable';

class AbbrsViewer extends React.PureComponent {
    constructor(props) {
        super(props);
        this.tableRef = React.createRef();
        this.state = {
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
        clog(this.props,false)
        clog(this.state,false)
        clog(this.tableRef.current,false)

        if(this.tableRef.current == null ){return}
        const abbrTable = this.tableRef.current.hotInstance;
        const newAbbrDict = {};

        for (var i = 0; i < abbrTable.countRows();i++){
            let fullWord = String(abbrTable.getDataAtRowProp(i,'value')).replace(/\s/g,' ');
            let abbr = abbrTable.getDataAtRowProp(i,'abbr');
            //console.log('abbr: ' + abbr)
            let enabled = abbrTable.getDataAtRowProp(i,'enabled')
            if(enabled){
                newAbbrDict[fullWord] = abbr;
            }
        }
        this.setState((state)=>{
            state.abbrDict = newAbbrDict;
            return state;
        })
        clog(new RegExp("(\\b)("+Object.keys(this.state.abbrDict).join("|")+")(\\b|$|\\$)",'g'))

        this.props.onAbbrChange(this.state.abbrDict);
        
    }
    render() {
        
        return (
            <div>
                <HotTable settings={this.props.settings} ref={this.tableRef} 
                afterChange={this.handleAbbrChange}
                afterPaste={this.handleAbbrChange}
                afterRemoveRow={this.handleAbbrChange}
                afterUpdateSettings={this.handleAbbrChange}/>
            </div>
        );
    }
}

