
const initialText = '- Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys;  \n\
- Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes;';

const tableData = [{
    enabled: true,
    abbr: 'eq',
    value: 'equipment', 
    },{
    enabled: true,
    abbr: 'tst',
    value: 'test',
    },];

const tableSettings = {
    data: tableData,
    columns: [{
        data: 'enabled',
        type: 'checkbox',
        disableVisualSelection: true,
        width:20
        },{
        data: 'value',
        type: 'text'
        },{
        data: 'abbr',
        type: 'text'
        },
    ],
    stretchH: 'all',
    width: 500,
    autoWrapRow: true,
    height: 500,
    maxRows: Infinity,
    manualRowResize: true,
    manualColumnResize: true,
    rowHeaders: true,
    colHeaders: [
        'Enabled',
        'Word',
        'Abbreviation',
    ],
    trimWhitespace: false,
    enterBeginsEditing:false,
    manualRowMove: true,
    manualColumnMove: true,
    columnSorting: {
        indicator: true
    },
    autoColumnSize: false,
    minRows: 15,
    contextMenu: true,
    licenseKey: 'non-commercial-and-evaluation',
    search: {
        queryMethod: function(queryStr,value){
            return queryStr.toString() === value.toString();
        },
        callback: function(instance, row, col, value, result){
            const DEFAULT_CALLBACK = function(instance, row, col, data, testResult) {
                instance.getCellMeta(row, col).isSearchResult = testResult;
            };

            DEFAULT_CALLBACK.apply(this, arguments);
        },
    },
};

class BulletApp extends React.Component {
    constructor(props){
        super(props);
        this.state={
            abbrDict: {},
            abbrReplacer: (sentence)=>{return sentence;}
        }
    }
    handleAbbrChange = (newAbbrDict)=>{
        this.setState({
            abbrDict: newAbbrDict,
            abbrReplacer: (sentence) => {
                //console.log('sentence in replaceAbbrs: "' + sentence + '"')
                const regExp = new RegExp("(\\b)("+Object.keys(newAbbrDict).join("|")+")(\\b|$|\\$)",'g');
                const newSentence = sentence.replace(regExp, 
                    (match,p1,p2,p3) => {
                        //p2 = p2.replace(/ /g,'\\s')
                        let abbr = this.state.abbrDict[p2];
                        if(!abbr){
                            abbr = '';
                        }
                        return p1 + abbr +  p3;
                    }
                );
                //console.log('sentence in replaceAbbrs replaced: "' + newSentence + '"')
                return newSentence;
            }
        })
    }

    render(){
        return (
            <div>
                <BulletComparator initialText={this.props.initialText} 
                    abbrReplacer={this.state.abbrReplacer} 
                    width="202.51mm"/>
                <AbbrsViewer settings={this.props.tableSettings} onAbbrChange={this.handleAbbrChange} />
            </div>
        );
    }
}

ReactDOM.render( <BulletApp tableSettings={tableSettings} initialText={initialText}/>, document.getElementById('stuff'));
