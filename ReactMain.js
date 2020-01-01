
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



    let settings;
    try{
        if(localStorage.getItem('bullet-settings')){
            settings = JSON.parse(localStorage.getItem("bullet-settings"));
            clog('settings have been retrieved', checkSave)
            clog(settings,checkSave)
            
        }
    }catch(err){
        if(err.name == 'SecurityError'){
            console.log('Was not able to get localstorage bullets due to use of file interface and browser privacy settings');
        }else{
            throw err;
        }
    }


class BulletApp extends React.Component {
    constructor(props){
        super(props);
        if(this.props.savedSettings){
            //enableOptim, text, and width should be in settings
            clog('settings are being loaded into BulletApp', checkSave)
            clog(this.props.savedSettings, checkSave)
            const settings = this.props.savedSettings[0];
            this.state={
                enableOptim: settings.enableOptim,
                text: settings.text,
                width: settings.width,
            };
            this.initialAbbrData = settings.abbrData.map((row)=>{
                return {
                    enabled: row[0],
                    abbr: row[1],
                    value: row[2], 
                };
            });

        }else{
            this.state={
                enableOptim: true,
                text: this.props.initialText,
                width: this.props.initialWidth,
            }
            this.initialAbbrData = this.props.initialAbbrData;
        }
        
        this.state.abbrDict = {};
        this.state.abbrReplacer = (sentence)=>{return sentence;};
        this.state.selection = '';
        this.abbrsViewerRef = React.createRef();

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
    handleOptimChange = (e) =>{
        this.setState({
            enableOptim: e.target.checked
        },()=>{
            clog("optimization toggle: "+ this.state.enableOptim, checkOptims)
        });
    }
    handleSelect = (newSel)=>{
        clog('selection registered',false);
        const maxWords = 8;
        this.setState({
            selection: Bullet.tokenize(newSel.trim()).slice(0,maxWords).join(' ')
        });
        
    }
    handleTextChange = (e) => {
        this.setState({
            text: e.target.value,
        });
    }
    handleWidthChange = (e) => {
        this.setState({
            width: e.target.value + 'mm',
        });
    }
    handleTextNorm = () => {
        this.setState((state) => {
            state.text = state.text.split('\n').map((line)=>{
                return line.replace(/\s+/g,' ')
            }).join('\n');
            return state
        });
    }
    handleTextUpdate = (newText)=>{
        return () => this.setState({
            text: newText,
        });
    }
    handleWidthUpdate = (newWidth) =>{
        return () => {
            this.setState({width: newWidth})
        };
    } 
    handleSave = () =>{
        clog(this.abbrsViewerRef,checkSave);
        clog(this.abbrsViewerRef.current.getData(),checkSave);
        return {
            width: this.state.width,
            text: this.state.text,
            abbrData: this.abbrsViewerRef.current.getData().filter((row)=>{
                return row[0] != null
            }),
            enableOptim:this.state.enableOptim,
            //do I need to add abbrReplacer?
        }
    }
    render(){
        return (
            <div>
                <DocumentTools 
                    enableOptim={this.state.enableOptim}
                    onOptimChange={this.handleOptimChange} 
                    width={this.state.width} onWidthChange={this.handleWidthChange} 
                    onWidthUpdate={this.handleWidthUpdate}
                    onTextNorm={this.handleTextNorm}
                    onTextUpdate={this.handleTextUpdate}
                    onSave={this.handleSave}
                    />
                <SynonymViewer word={this.state.selection} abbrDict={this.state.abbrDict} abbrReplacer={this.state.abbrReplacer} />
                <BulletComparator text={this.state.text} 
                    abbrReplacer={this.state.abbrReplacer} handleTextChange={this.handleTextChange}
                    width={this.state.width} onSelect={this.handleSelect} enableOptim={this.state.enableOptim} />
                <AbbrsViewer settings={this.props.tableSettings} 
                    initialData={this.initialAbbrData} 
                    onAbbrChange={this.handleAbbrChange} ref={this.abbrsViewerRef}/>
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

// /
fontReady.then( ()=>{
    ReactDOM.render( <BulletApp savedSettings={settings} tableSettings={tableSettings} initialAbbrData={tableData} initialText={initialText} initialWidth={"202.321mm"}/>, document.getElementById('stuff'));
});
