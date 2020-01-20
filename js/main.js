
const initialText = '- This is a custom built bullet writing tool; abbreviations will be replaced according to table below--you will see output on the right\n\
- This tool can optimize spacing; output will be red if the optimizer could not fix spacing with 2004 or 2009 Unicode spaces\n\
- There is a thesaurus above; select a word in this or the output box to view synonyms--words in parentheses are abbreviations you have configured';

const tableData = [{
    enabled: true,
    value: 'abbreviations', 
    abbr: 'abbrs',
    },{
    enabled: true,
    value: 'table',
    abbr: 'tbl',
    },{
    enabled: true,
    value: 'optimize',
    abbr: 'optim',
    },{
    enabled: true,
    value: 'with ',
    abbr: 'w/',
    },{
    enabled: true,    
    value: 'parentheses',
    abbr: 'parens',
    },
];

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
            
            this.state = BulletApp.ParseSettings(this.props.savedSettings);
            
            

        }else{
            this.state={
                enableOptim: true,
                text: this.props.initialText,
                width: this.props.initialWidth,
                abbrData: this.props.abbrData,
            }
        }
        
        this.state.abbrDict = {};
        this.state.abbrReplacer = (sentence)=>{return sentence;};
        this.state.selection = '';
        this.state.currentTab = 0;
        this.abbrsViewerRef = React.createRef();

    }
    static ParseSettings = (settingsAll) => {
        const settings = settingsAll[0];
        
        const state={
            enableOptim: settings.enableOptim,
            text: settings.text,
            width: settings.width,
            abbrData: settings.abbrData.map((row)=>{
                return {
                    enabled: row[0],
                    value: row[1], 
                    abbr: row[2],
                };
            }),
        };
        return state;
    }
    handleJSONImport = (settings)=>{
        clog("handleJSONImport: ", checkJSON) 
        clog(settings, checkJSON)
        this.setState({text:settings.text});
        this.setState((state)=>{
            state.enableOptim = settings.enableOptim;
            state.width = settings.width;
            state.abbrData= settings.abbrData;
            return state;
        },);
        // some sort of race condition happens if I try to set text and other settings at the same time!

    }
    handleAbbrChange = (tableRef)=>{
        if(tableRef.current == null ){return}
        const abbrTable = tableRef.current.hotInstance;
        const newAbbrDict = {};

        for (let i = 0; i < abbrTable.countRows();i++){
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
    handleOptimChange = () =>{
        this.setState((state)=>{
            return {enableOptim: !state.enableOptim};
        },()=>{
            clog("optimization toggle: "+ this.state.enableOptim, checkOptims)
        });
    }
    handleSelect = (newSel)=>{
        clog('selection registered',checkThesaurus);
        const maxWords = 8;
        if(newSel.trim() != ''){
            this.setState({
                selection: Bullet.Tokenize(newSel.trim()).slice(0,maxWords).join(' ')
            });
        }

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
    handleTabChange = (newTab)=>{
        return ()=>{
            this.setState({currentTab: newTab})
        };
    }
    render(){
        const tabs = ['Bullets', 'Abbreviations'];
        return (
            <div className="container is-fluid">
                <div className='columns is-multiline'>
                    <div className='column is-full'>
                        <Logo />
                        <DocumentTools 
                            enableOptim={this.state.enableOptim}
                            onOptimChange={this.handleOptimChange} 
                            width={this.state.width} onWidthChange={this.handleWidthChange} 
                            onWidthUpdate={this.handleWidthUpdate}
                            onTextNorm={this.handleTextNorm}
                            onTextUpdate={this.handleTextUpdate}
                            onSave={this.handleSave}
                            onJSONImport={this.handleJSONImport}
                            />
                    </div>
                
                    <div className='column is-full'>
                        <SynonymViewer word={this.state.selection} abbrDict={this.state.abbrDict} abbrReplacer={this.state.abbrReplacer} />
                    </div>
                    <div className="column is-full">
                        <div className="tabs">
                            <ul>
                                {tabs.map((tab,i)=>{
                                    return (
                                        <li key={i} className={this.state.currentTab == i?"is-active":''} ><a onClick={this.handleTabChange(i)}>{tab}</a></li>
                                    )}
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className={'column is-full' + ' ' + (this.state.currentTab != 0?'is-hidden':'')}>
                        <BulletComparator text={this.state.text} 
                            abbrReplacer={this.state.abbrReplacer} handleTextChange={this.handleTextChange}
                            width={this.state.enableOptim? (parseFloat(this.state.width.replace(/[a-zA-Z]/g,''))-0.00)+'mm':this.state.width} 
                            onSelect={this.handleSelect} enableOptim={this.state.enableOptim} />
                    </div>
                    <div className={'column is-full' + ' ' + (this.state.currentTab != 1?'is-invisible':'')}>
                        <AbbrsViewer settings={this.props.tableSettings} 
                        abbrData={this.state.abbrData} 
                        onAbbrChange={this.handleAbbrChange} ref={this.abbrsViewerRef}/>
                    </div>
                </div>    
                
                
                    
                
            </div>
        );
    }
}
// implementing fontReady as a promise (instead of using document.fonts.ready) to make it Edge compatible
const fontReady = new Promise(function(resolve,rej){
    WebFont.load({
        custom: {
            families: ['AdobeTimes']
        }
    });
    resolve();
});

// /
fontReady.then( ()=>{
    ReactDOM.render( <BulletApp savedSettings={settings} tableSettings={tableSettings} abbrData={tableData} initialText={initialText} initialWidth={"202.321mm"}/>, document.getElementById('stuff'));
});
