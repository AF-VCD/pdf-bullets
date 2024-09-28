
const initialText = '- This is a custom built bullet writing tool; abbreviations will be replaced according to table in the abbreviations tab--you will see output on the right\n\
- This tool can optimize spacing; output will be red if the optimizer could not fix spacing with 2004 or 2006 Unicode spaces\n\
- Click the thesaurus button to show one; select a word in this or the output box to view synonyms--words in parentheses are abbreviations that are configured';

const tableData = [{
    enabled: true,
    value: 'Airman Basic',
    abbr: 'AB',
    },{
    enabled: true,
    value: 'Airman',
    abbr: 'Amn',
    },{
    enabled: true,
    value: 'Airman First Class',
    abbr: 'A1C',
    },{
    enabled: true,
    value: 'Senior Airman',
    abbr: 'SrA',
    },{
    enabled: true,
    value: 'Staff Sergeant',
    abbr: 'SSgt',
    },{
    enabled: true,
    value: 'Technical Sergeant',
    abbr: 'TSgt',
    },{
    enabled: true,
    value: 'Master Sergeant',
    abbr: 'MSgt',
    },{
    enabled: true,
    value: 'Senior Master Sergeant',
    abbr: 'SMSgt',
    },{
    enabled: true,
    value: 'Senior Master Sergeant',
    abbr: 'SMSgt',
    },{
    enabled: true,
    value: 'Chief Master Sergeant',
    abbr: 'CMSgt',
    },{
    enabled: true,
    value: 'Command Chief Master Sergeant',
    abbr: 'CCM',
    },{
    enabled: true,
    value: 'Second Lieutenant',
    abbr: '2d Lt',
    },{
    enabled: true,
    value: 'First Lieutenant',
    abbr: '1st Lt',
    },{
    enabled: true,
    value: 'Captain',
    abbr: 'Capt',
    },{
    enabled: true,
    value: 'Major',
    abbr: 'Maj',
    },{
    enabled: true,
    value: 'Lieutenant Colonel',
    abbr: 'Lt Col',
    },{    
    enabled: true,
    value: 'Colonel',
    abbr: 'Col',
    },{
    enabled: true,
    value: 'Brigadier General',
    abbr: 'Brig Gen',
    },{
    enabled: true,
    value: 'Major General',
    abbr: 'Maj Gen',
    },{
    enabled: true,
    value: 'Lieutenant General',
    abbr: 'Lt Gen',
    },{    
    enabled: true,
    value: 'General',
    abbr: 'Gen',
    },{
    enabled: true,
    value: 'AIR BATTLE MANAGER',
    abbr: 'ABM',
    },{
    enabled: true,
    value: 'AGILE COMBAT EMPLOYMENT',
    abbr: 'ACE',
    },{
    enabled: true,
    value: 'ACTIVE DUTY',
    abbr: 'AD',
    },{
    enabled: true,
    value: 'ADMINISTRATIVE CONTROL',
    abbr: 'ADCON',
    },{
    enabled: true,
    value: 'AIRCREW FLIGHT EQUIPMENT',
    abbr: 'AFE',
    },{
    enabled: true,
    value: 'AIR FORCE GENERATION',
    abbr: 'AFFORGEN',
    },{
    enabled: true,
    value: 'AIR FORCE INSTRUCTION',
    abbr: 'AFI',
    },{
    enabled: true,
    value: 'AIR FORCE MANUAL',
    abbr: 'AFMAN',
    },{
    enabled: true,
    value: 'AIR FORCE SPECIALTY CODE',
    abbr: 'AFSC',
    },{
    enabled: true,
    value: 'AIR FORCE SMART OPERATIONS FOR THE 21ST CENTURY',
    abbr: 'AFSO21',
    },{
    enabled: true,
    value: 'AEROSPACE GROUND EQUIPMENT',
    abbr: 'AGE',
    },{
    enabled: true,
    value: 'ARTIFICIAL INTELLIGENCE',
    abbr: 'AI',
    },{
    enabled: true,
    value: 'AIRMAN LEADERSHIP QUALITY',
    abbr: 'ALQ',
    },{
    enabled: true,
    value: 'AIRMAN LEADERSHIP SCHOOL',
    abbr: 'ALS',
    },{
    enabled: true,
    value: 'AREA OF RESPONSIBILITY',
    abbr: 'AOR',
    },{
    enabled: true,
    value: 'APPROPRIATED FUNDS',
    abbr: 'APF',
    },{
    enabled: true,
    value: 'AIR RESERVE TECHNICIAN',
    abbr: 'ART',
    },{
    enabled: true,
    value: 'ANNUAL TOUR',
    abbr: 'AT',
    },{
    enabled: true,
    value: 'AIR TASKING ORDER',
    abbr: 'ATO',
    },{
    enabled: true,
    value: 'BASIC MILITARY TRAINING',
    abbr: 'BMT',
    },{
    enabled: true,
    value: 'BY NAME REQUEST',
    abbr: 'BNR',
    },{
    enabled: true,
    value: 'COMMAND AND CONTROL',
    abbr: 'C2',
    },{
    enabled: true,
    value: 'COMMAND, CONTROL, COMMUNICATIONS, COMPUTERS, INTELLIGENCE, SURVEILLANCE AND RECONNAISSANCE',
    abbr: 'C4ISR',
    },{
    enabled: true,
    value: 'COMBINED AIR OPERATIONS CENTER',
    abbr: 'CAOC',
    },{
    enabled: true,
    value: 'CLOSE AIR SUPPORT',
    abbr: 'CAS',
    },{
    enabled: true,
    value: 'CRISIS ACTION TEAM',
    abbr: 'CAT',
    },{
    enabled: true,
    value: 'COMBAT ARMS TRAINING AND MAINTENANCE',
    abbr: 'CATM',
    },{
    enabled: true,
    value: 'CHEMICAL, BIOLOGICAL, RADIOLOGICAL, NUCLEAR',
    abbr: 'CBRN',
    },{
    enabled: true,
    value: 'COMPUTER BASED TRAINING',
    abbr: 'CBT',
    },{
    enabled: true,
    value: 'COMMANDER\'S INSPECTION PROGRAM',
    abbr: 'CCIP',
    },{
    enabled: true,
    value: 'COMMANDER DIRECTED INVESTIGATION',
    abbr: 'CDI',
    },{
    enabled: true,
    value: 'CHIEF MASTER SERGEANT LEADERSHIP ACADEMY',
    abbr: 'CLA',
    },{
    enabled: true,
    value: 'CHIEF MASTER SERGEANT LEADERSHIP COURSE',
    abbr: 'CLC',
    },{
    enabled: true,
    value: 'COURSE OF ACTION',
    abbr: 'COA',
    },{
    enabled: true,
    value: 'CONGRESSIONAL DELEGATION',
    abbr: 'CODEL',
    },{
    enabled: true,
    value: 'COUNTER INSURGENCY',
    abbr: 'COIN',
    },{
    enabled: true,
    value: 'CONCEPT OF OPERATIONS',
    abbr: 'CONOPS',
    },{
    enabled: true,
    value: 'CONTINENTAL UNITED STATES',
    abbr: 'CONUS',
    },{
    enabled: true,
    value: 'CONTINUITY OF OPERATIONS',
    abbr: 'COOP',
    },{
    enabled: true,
    value: 'COMBAT SEARCH AND RESCUE',
    abbr: 'CSAR',
    },{
    enabled: true,
    value: 'DEFENSE EQUAL OPPORTUNITY CLIMATE SURVEY',
    abbr: 'DEOCS',
    },{
    enabled: true,
    value: 'DINING FACILITY',
    abbr: 'DFAC',
    },{
    enabled: true,
    value: 'DISTINGUISHED GRADUATE',
    abbr: 'DG',
    },{
    enabled: true,
    value: 'DISTINGUISHED VISITOR',
    abbr: 'DV',
    },{
    enabled: true,
    value: 'ENEMY KILLED IN ACTION',
    abbr: 'EKIA',
    },{
    enabled: true,
    value: 'EMERGENCY OPERATIONS CENTER',
    abbr: 'EOC',
    },{
    enabled: true,
    value: 'EXPLOSIVE ORDNANCE DISPOSAL',
    abbr: 'EOD',
    },{
    enabled: true,
    value: 'END OF YEAR',
    abbr: 'EOY',
    },{
    enabled: true,
    value: 'ENLISTED PERFORMANCE REPORT',
    abbr: 'EPR',
    },{
    enabled: true,
    value: 'ELECTRONIC WARFARE',
    abbr: 'EW',
    },{
    enabled: true,
    value: 'FUNCTIONAL AREA MANAGER',
    abbr: 'FAM',
    },{
    enabled: true,
    value: 'FLYING HOUR PROGRAM',
    abbr: 'FHP',
    },{
    enabled: true,
    value: 'FULLY MISSION CAPABLE',
    abbr: 'FMC',
    },{
    enabled: true,
    value: 'FORWARD OPERATING BASE',
    abbr: 'FOB',
    },{
    enabled: true,
    value: 'FULL OPERATIONAL CAPABILITY',
    abbr: 'FOC',
    },{
    enabled: true,
    value: 'FORWARD OPERATING LOCATION',
    abbr: 'FOL',
    },{
    enabled: true,
    value: 'FORCE PROTECTION CONDITIONS',
    abbr: 'FPCON',
    },{
    enabled: true,
    value: 'FIRST TERM AIRMEN CENTER',
    abbr: 'FTAC',
    },{
    enabled: true,
    value: 'FORMAL TRAINING UNIT',
    abbr: 'FTU',
    },{
    enabled: true,
    value: 'GOVERNMENT PURCHASE CARD',
    abbr: 'GPC',
    },{
    enabled: true,
    value: 'GEOGRAPHICALLY SEPARATED UNIT',
    abbr: 'GSU',
    },{
    enabled: true,
    value: 'GOVERNMENT TRAVEL CARD',
    abbr: 'GTC',
    },{
    enabled: true,
    value: 'INACTIVE DUTY FOR TRAINING',
    abbr: 'IADT',
    },{
    enabled: true,
    value: 'INTERMEDIATE DEVELOPMENTAL EDUCATION',
    abbr: 'IDE',
    },{
    enabled: true,
    value: 'IMPROVISED EXPLOSIVE DEVICE',
    abbr: 'IED',
    },{
    enabled: true,
    value: 'INDIVIDUAL MOBILIZATION AUGMENTEE',
    abbr: 'IMA',
    },{
    enabled: true,
    value: 'INITIAL OPERATIONAL CAPABILITY',
    abbr: 'IOC',
    },{
    enabled: true,
    value: 'INSTRUCTOR PILOT',
    abbr: 'IP',
    },{
    enabled: true,
    value: 'INTELLIGENCE, SURVEILLANCE, AND RECONNAISSANCE',
    abbr: 'ISR',
    },{
    enabled: true,
    value: 'INFORMATION TECHNOLOGY',
    abbr: 'IT',
    },{
    enabled: true,
    value: 'JOINT ALL DOMAIN COMMAND AND CONTROL',
    abbr: 'JADC2',
    },{
    enabled: true,
    value: 'JUNIOR RESERVE OFFICER TRAINING CORPS',
    abbr: 'JROTC',
    },{
    enabled: true,
    value: 'KILLED IN ACTION',
    abbr: 'KIA',
    },{
    enabled: true,
    value: 'LINE OF EFFORT',
    abbr: 'LOE',
    },{
    enabled: true,
    value: 'MILITARY CONSTRUCTION',
    abbr: 'MILCON',
    },{
    enabled: true,
    value: 'MEMORANDUM OF AGREEMENT',
    abbr: 'MOA',
    },{
    enabled: true,
    value: 'MEMORANDUM OF UNDERSTANDING',
    abbr: 'MOU',
    },{
    enabled: true,
    value: 'MULTI-CAPABLE AIRMEN',
    abbr: 'MCA',
    },{
    enabled: true,
    value: 'NONAPPROPRIATED FUNDS',
    abbr: 'NAF',
    },{
    enabled: true,
    value: 'NONCOMMISSIONED OFFICER ACADEMY',
    abbr: 'NCOA',
    },{
    enabled: true,
    value: 'NATIONAL CAPITAL REGION',
    abbr: 'NCR',
    },{
    enabled: true,
    value: 'NATIONAL DEFENSE AUTHORIZATION ACT',
    abbr: 'NDAA',
    },{
    enabled: true,
    value: 'NATIONAL DEFENSE STRATEGY',
    abbr: 'NDS',
    },{
    enabled: true,
    value: 'NONCOMBATANT EVACUATION OPERATION',
    abbr: 'NEO',
    },{
    enabled: true,
    value: 'NON-SECURE INTERNET PROTOCOL ROUTER',
    abbr: 'NIPR',
    },{
    enabled: true,
    value:  'NON MISSION CAPABLE',
    abbr: 'NMC',
    },{
    enabled: true,
    value: 'OPERATIONS AND MAINTENANCE',
    abbr: 'O&M',
    enabled: true,
    value: 'OVERSEAS CONTINGENCY OPERATIONS',
    abbr: 'OCO',
    },{
    enabled: true,
    value: 'OUTSIDE CONTINENTAL UNITED STATES',
    abbr: 'OCONUS',
    },{
    enabled: true,
    value: 'ON THE JOB TRAINING',
    abbr: 'OJT',
    },{
    enabled: true,
    value: 'OPERATIONS PLAN',
    abbr: 'OPLAN',
    },{
    enabled: true,
    value: 'PRIMARY DEVELOPMENTAL EDUCATION',
    abbr: 'PDE',
    },{
    enabled: true,
    value: 'PROFESSIONAL MILITARY EDUCATION',
    abbr: 'PME',
    },{
    enabled: true,
    value: 'POINT OF CONTACT',
    abbr: 'POC',
    },{
    enabled: true,
    value: 'PHYSICAL TRAINING',
    abbr: 'PT',
    },{
    enabled: true,
    value: 'QUALITY ASSURANCE',
    abbr: 'QA',
    },{
    enabled: true,
    value: 'QUALITY OF LIFE',
    abbr: 'QoL',
    },{
    enabled: true,
    value: 'RULES OF ENGAGEMENT',
    abbr: 'ROE',
    },{
    enabled: true,
    value: 'RESERVE OFFICER TRAINING CORPS',
    abbr: 'ROTC',
    },{
    enabled: true,
    value: 'SEXUAL ASSAULT PREVENTION AND RESPONSE',
    abbr: 'SAPR',
    },{
    enabled: true,
    value: 'SENIOR DEVELOPMENTAL EDUCATION',
    abbr: 'SDE',
    },{
    enabled: true,
    value: 'SUBJECT MATTER EXPERT',
    abbr: 'SME',
    },{
    enabled: true,
    value: 'SENIOR NONCOMMISSIONED OFFICER ACADEMY',
    abbr: 'SNCOA',
    },{
    enabled: true,
    value: 'STANDARD OPERATING PROCEDURE',
    abbr: 'SOP',
    },{
    enabled: true,
    value: 'SQUADRON OFFICER SCHOOL',
    abbr: 'SOS',
    },{
    enabled: true,
    value: 'SCIENCE, TECHNOLOGY, ENGINEERING, AND MATHEMATICS',
    abbr: 'STEM',
    },{
    enabled: true,
    value: 'TEMPORARY DUTY',
    abbr: 'TDY',
    },{
    enabled: true,
    value: 'TOTAL FORCE INTEGRATION',
    abbr: 'TFI',
    },{
    enabled: true,
    value: 'TRADITIONAL RESERVIST',
    abbr: 'TR',
    },{
    enabled: true,
    value: 'TOP SECRET',
    abbr: 'TS',
    },{
    enabled: true,
    value: 'UNIT COMPLIANCE INSPECTION',
    abbr: 'UCI',
    },{
    enabled: true,
    value: 'UNIFORM CODE OF MILITARY JUSTICE',
    abbr: 'UCMJ',
    },{
    enabled: true,
    value: 'UNIT EFFECTIVENESS INSPECTION',
    abbr: 'UEI',
    },{
    enabled: true,
    value: 'EXPEDITIONARY AIRBASE',
    abbr: 'XAB',
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
                    if(!p3){
                        p3 = '';
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
incrementVisitors();
    
function incrementVisitors() {
  // code for incrementing visitor count    
  const xh = new XMLHttpRequest();
  xh.onreadystatechange = () => {  
    if(xh.readyState === XMLHttpRequest.DONE) {
      var status = xh.status;
      if (status === 0 || (status >= 200 && status < 400)) {
        // The request has been completed successfully
        const count = JSON.parse(xh.response).Count;
        console.log("The bullets site(s) have been visited " + count + " times.");
      } else {
        console.log("Visitor count increment task failed successfully");
      }
    }
  }
  xh.open("POST", "https://g5z50elklh.execute-api.us-east-2.amazonaws.com/default/LogVisitors",true); 
  xh.send();
}
    
