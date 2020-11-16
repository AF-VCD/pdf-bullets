import React from "react"
import {BULLET, BulletComparator} from "./bullets.js"
import {Logo,DocumentTools}  from "./tools.js"
import AbbrsViewer from "./abbrs.js"
import SynonymViewer from "./thesaurus.js"
 // booleans for debugging


const DPI = 96;
const MM_PER_IN = 25.4;
const DPMM = DPI / MM_PER_IN;

class BulletApp extends React.Component {
    constructor(props){
        super(props);
        if(this.props.savedSettings){
            //enableOptim, text, and width should be in settings
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
        this.state.replacedWord = '';

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

        //this handles the very first abbreviation replacement when the page is first opened. not prettu but it works.
        if(tableRef.current == null ){this.setState({
            abbrDict: this.createAbbrDict(this.state.abbrData),
        })
        return;
        }
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
                        finalAbbrDict[word] = abbrs.enabled[abbrs.enabled.length-1];
                    }
                }
            )

            // courtesy of https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex 
            function escapeRegExp(string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
            }

            let modifiers = 'g';
            const allApprovedAbbrs = Object.keys(finalAbbrDict).map(escapeRegExp).join('|');

            // some info on the boundary parts of the regex:
            // (^|\\W|\\b) 
            //     ^ - ensures words at the beginning of line are considered for abbreviation
            //     \\W - expects abbr to be preceded by a non-word, i.e. a space, semicolon, dash, etc.
            //     \\b - also check for word boundaries, this is necessary for edge cases like 'f/ ' and 'w/ '.
            //            Otherwise things like 'with chicken' and 'for $2M' won't resolve to 'w/chicken' and 'f/$2M'.
            // (\\W|\\b|$)
            //     \\W, \\b - see above
            //     $ - ensures words at end of line are considered for abbreviation
            const regExp = new RegExp("(^|\\W|\\b)("+ allApprovedAbbrs +")(\\W|\\b|$)", modifiers);
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

            
            return newSentence;
        }
    }
    handleOptimChange = () =>{
        this.setState((state)=>{
            return {enableOptim: !state.enableOptim};
        });
    }
    handleSelect = (newSel)=>{
        
        const maxWords = 8;
        if(newSel.trim() !== ''){
            
            this.setState({
                selection: BULLET.Tokenize(newSel.trim()).slice(0,maxWords).join(' ')
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

        return {
            width: this.state.width,
            text: this.state.text,
            abbrData: this.abbrsViewerRef.current.getData().filter((row)=>{
                return row[0] !== null
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
    handleSelReplace = (word) => {
        this.setState({replacedWord: word});
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
                                        <li key={i} className={this.state.currentTab === i?"is-active":''} ><a onClick={this.handleTabChange(i)}>{tab}</a></li>
                                    )}
                                )}
                            </ul>
                        </div>
                    </div>
                    {this.state.currentTab===0? (
                    <div className='column is-full'>
                        <BulletComparator text={this.state.text} 
                            abbrReplacer={abbrReplacer} handleTextChange={this.handleTextChange}
                            width={
                                this.state.enableOptim? (parseFloat(this.state.width.replace(/[a-zA-Z]/g,''))-0.00)+'mm':this.state.width
                            } 
                            replacedWord={this.state.replacedWord}
                            onSelect={this.handleSelect} enableOptim={this.state.enableOptim} />
                    </div> ) : '' }
                    <div className={'column is-full' + ' ' + (this.state.currentTab !== 1?'is-invisible':'')}>
                        <AbbrsViewer settings={this.props.tableSettings} 
                        abbrData={this.state.abbrData} 
                        onAbbrChange={this.handleAbbrChange} ref={this.abbrsViewerRef} />
                    </div>
                </div>    
            </div>
        );
    }
}

export default BulletApp;