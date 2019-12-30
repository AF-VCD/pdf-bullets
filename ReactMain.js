
const initialText = '- Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys;  \n\
- Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes;equipment test';

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
            abbrReplacer: (sentence)=>{return sentence;},
            selection: "",
            enableOptim: true,
        }
        this.bulletComparatorRef = React.createRef();
    }
    handleAbbrChange = (newAbbrDict)=>{
        this.setState({
            abbrDict: newAbbrDict,
            abbrReplacer: (sentence) => {
                const finalAbbrDict = {};
                Object.keys(newAbbrDict).map(
                    (word)=>{
                        const abbrs = newAbbrDict[word]; //an array
                        //if there is at least one enabled abbreviation, take the lowest most element of it.
                        if(abbrs.enabled) {
                            finalAbbrDict[word] = abbrs.enabled[abbrs.enabled.length-1]
                        }
                    }
                )
                clog(finalAbbrDict, false)
                const regExp = new RegExp("(\\b)("+Object.keys(finalAbbrDict).join("|")+")(\\b|$|\\$)",'g');
                const newSentence = sentence.replace(regExp, 
                    (match,p1,p2,p3) => {
                        //p2 = p2.replace(/ /g,'\\s')
                        let abbr = finalAbbrDict[p2];
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
    handleSelect = (newSel)=>{
        clog('selection registered',false);
        const maxWords = 8;
        this.setState({
            selection: Bullet.tokenize(newSel.trim()).slice(0,maxWords).join(' ')
        });
        
    }
    
    render(){
        return (
            <div>
                <DocumentTools enableOptim={this.state.enableOptim} onOptimChange={this.handleOptimChange} bulletComparator={this.bulletComparatorRef.current} />
                <SynonymViewer word={this.state.selection} abbrDict={this.state.abbrDict} abbrReplacer={this.state.abbrReplacer} />
                <BulletComparator initialText={this.props.initialText} 
                    abbrReplacer={this.state.abbrReplacer} 
                    width="202.51mm" onSelect={this.handleSelect} enableOptim={this.state.enableOptim} ref={this.bulletComparatorRef}/>
                <AbbrsViewer settings={this.props.tableSettings} 
                    initialData={this.props.initialData} 
                    onAbbrChange={this.handleAbbrChange} />
            </div>
        );
    }
}
// implementing fontReady as a promise (instead of using document.fonts.ready) to make it Edge compatible
var fontReady = new Promise(function(resolve,rej){
    WebFont.load({
        custom: {
            families: ['AdobeTimes']
        }
    });
    resolve();
});

fontReady.then( ()=>{
    ReactDOM.render( <BulletApp tableSettings={tableSettings} initialData={tableData} initialText={initialText} />, document.getElementById('stuff'));
});
