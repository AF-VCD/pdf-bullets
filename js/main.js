
const initialText = '- This is a custom built bullet writing tool; abbreviations will be replaced according to table in the abbreviations tab--you will see output on the right\n\
- This tool can optimize spacing; output will be red if the optimizer could not fix spacing with 2004 or 2006 Unicode spaces\n\
- Click the thesaurus button to show one; select a word in this or the output box to view synonyms--words in parentheses are abbreviations that are configured';

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
            if( checkSave) console.log('settings have been retrieved')
            if(checkSave) console.log(settings)
            
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
            if( checkSave) console.log('settings are being loaded into BulletApp')
            if( checkSave) console.log(this.props.savedSettings)
            
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
        this.state.textSelRange = {start: 0, end:0}
        this.state.selection = '';
        this.state.currentTab = 0;
        this.abbrsViewerRef = React.createRef();
        this.state.showThesaurus = false;

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
        if( checkJSON) console.log("handleJSONImport: ") 
        if( checkJSON) console.log(settings)
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
        })
        if(checkAbbrs) {
            console.log('handling abbr change in main.js');
            console.log(this.state.abbrReplacer + '')
        }

    }
    createAbbrDict = (abbrData)=>{

        const abbrDict = {};
        abbrData.map((row)=>{
            let fullWord = String(row.value).replace(/\s/g,' ');
            let abbr = row.abbr;
            let enabled = row.enabled;
            abbrDict[fullWord] = abbrDict[fullWord] || []; //initializes to empty array if necessary

            if(enabled){
                abbrDict[fullWord].enabled = abbrDict[fullWord].enabled || [];
                abbrDict[fullWord].enabled.push(abbr)
            }else{
                abbrDict[fullWord].disabled = abbrDict[fullWord].disabled || [];
                abbrDict[fullWord].disabled.push(abbr)
            }
        })

        return abbrDict;

    }
    createAbbrReplacer = (abbrDict) => {
        return (sentence) => {
            const finalAbbrDict = {};
            Object.keys(abbrDict).map(
                (word)=>{
                    const abbrs = abbrDict[word]; //an array
                    //if there is at least one enabled abbreviation, take the lowest most element of it.
                    if(abbrs.enabled) {
                        finalAbbrDict[word] = abbrs.enabled[abbrs.enabled.length-1]
                    }
                }
            )
            let modifiers = 'g'
            const regExp = new RegExp("(\\b)("+Object.keys(finalAbbrDict).join("|")+")(\\b|$|\\$)", modifiers);
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
            if( checkAbbrs) {
                console.log('abbrReplacer original: "' + sentence + '"')
                console.log('abbrReplacer replaced: "' + newSentence + '"')
            }
            return newSentence;
        }
    }
    handleOptimChange = () =>{
        this.setState((state)=>{
            return {enableOptim: !state.enableOptim};
        },()=>{
            if( checkOptims) console.log("optimization toggle: "+ this.state.enableOptim)
        });
    }
    handleSelect = (newSel)=>{
        
        const maxWords = 8;
        if(newSel.trim() != ''){
            if(checkThesaurus) console.log('selection registered');
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
        if(checkSave) console.log(this.abbrsViewerRef);
        if(checkSave) console.log(this.abbrsViewerRef.current.getData());
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
    handleThesaurusHide = () => {
        const oldState = this.state.showThesaurus;
        this.setState({showThesaurus: !oldState});
    }
    handleSelReplace = (start,end, word) => {
        const oldText = this.state.text;
        const beforeText = oldText.substring(0,start);
        const replacedText = oldText.substring(start,end);
        const match = replacedText.match(/^(\s*).*?(\s*)$/);
        const beforeSpaces = match[1];
        const afterSpaces = match[2];
        let newWord
        if(replacedText.match(/^\s*[A-Z]/)){
            newWord = word.split(/\s/).map((subword)=>{return subword[0].toUpperCase() + subword.slice(1)}).join(' ')
        }else{ newWord = word }
        
        const afterText = oldText.substring(end);
        console.log(beforeText+beforeSpaces, beforeText+beforeSpaces+newWord)
        console.log((beforeText+beforeSpaces).length, (beforeText+beforeSpaces+newWord).length)
        this.setState({
            text: beforeText+beforeSpaces+newWord+afterSpaces+afterText,
            textSelRange:  {trigger: Math.random(), start: (beforeText+beforeSpaces).length, end: (beforeText+beforeSpaces+newWord).length}
        })
        
    }
    handleCaseChange = () => {
        this.setState((state)=>{
            state.enableCase = !state.enableCase;
            return state;
        })
    }
    render(){
        const tabs = ['Bullets', 'Abbreviations'];
        const abbrReplacer = this.createAbbrReplacer(this.state.abbrDict);
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
                            onThesaurusHide={this.handleThesaurusHide}
                            />
                    </div>
                
                    <div className={'column is-full' + ' ' + (this.state.showThesaurus? "":"is-hidden")}>
                        <SynonymViewer word={this.state.selection} onSelReplace={this.handleSelReplace} abbrDict={this.state.abbrDict} abbrReplacer={abbrReplacer} 
                            onHide={this.handleThesaurusHide}/>
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
                    {this.state.currentTab==0? (
                    <div className='column is-full'>
                        <BulletComparator text={this.state.text} textSelRange={this.state.textSelRange}
                            abbrReplacer={abbrReplacer} handleTextChange={this.handleTextChange}
                            width={this.state.enableOptim? (parseFloat(this.state.width.replace(/[a-zA-Z]/g,''))-0.00)+'mm':this.state.width} 
                            onSelect={this.handleSelect} enableOptim={this.state.enableOptim} />
                    </div> ) : '' }
                    <div className={'column is-full' + ' ' + (this.state.currentTab != 1?'is-invisible':'')}>
                        <AbbrsViewer settings={this.props.tableSettings} 
                        abbrData={this.state.abbrData} 
                        onAbbrChange={this.handleAbbrChange} ref={this.abbrsViewerRef} />
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
