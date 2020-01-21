class SynonymViewer extends React.PureComponent{
    constructor(props){
        super(props)
        this.state={
            synonyms:[],
            hidden:true,
        }
    }
    getSynonyms = (phrase)=>{
        if( checkThesaurus) console.log('finding synonyms for '+ phrase);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange =  () => {
            if(xhttp.readyState == 4 && xhttp.status == 200){
                const dat = JSON.parse(xhttp.responseText);
                if(checkThesaurus) console.log(dat);
                if(dat.length != 0){
                    this.setState({
                        synonyms: dat.map((item)=>{return item.word}),
                    });
                }else{
                    this.setState({
                        synonyms:[]
                    })
                }
            }
        }
        const maxWords=75;
        xhttp.open("GET","https://api.datamuse.com/words?max="+ maxWords + "&ml=" + phrase, true)
        xhttp.send();
    }
    componentDidMount(){
        if( checkThesaurus) console.log('componentDidMount getting synonyms for ' + this.props.word)
        this.getSynonyms(this.props.word);
    }
    componentDidUpdate(prevProps){
        if(prevProps.word != this.props.word){
            if( checkThesaurus) console.log("componentDidUpdate getting synonyms for " + this.props.word)
            this.getSynonyms(this.props.word);
        }
    }

    render(){
        const replacedWord = this.props.abbrReplacer(this.props.word);
        const otherAbbrs = this.props.abbrDict[this.props.word];
        const header = <Synonym word={this.props.word} key={this.props.word}
                            abbr={replacedWord==this.props.word ? "" : replacedWord} 
                            otherAbbrs={otherAbbrs}/>
        const synonyms =  <SynonymList onSelReplace={this.props.onSelReplace} key={this.state.synonyms.join('')} synonyms={this.state.synonyms} abbrDict={this.props.abbrDict} abbrReplacer={this.props.abbrReplacer} />;
        const explanation = <a className="panel-block" key='init'>Auto-thesaurus box - highlight a word or phrase below to show synonyms in this box</a>;
        const noResults = <a className="panel-block"  key='none'>no results found</a>;
        let mainBody;
        if(this.props.word == ''){
            mainBody = explanation;
        }else if(this.state.synonyms.length == 0){
            mainBody = noResults;
        }else{
            mainBody = synonyms;
        }
        
        return (
            <div className="card">
                <header className="card-header has-background-light	is-shadowless">
                    <a className="card-header-title" >
                        <span style={{marginRight:'5px'}}>Thesaurus{this.props.word==''?'':":"}</span>
                        {header} 
                    </a>
                    <a className="card-header-icon" onClick={this.props.onHide}>
                        <span className="delete">
                            <i className="fas fa-angle-down" aria-hidden="true"></i>
                        </span>
                    </a>
                </header>
                <div className="card-content" style={{height:"275px", overflow:"auto"}} >
                    
                    {mainBody}                   
                    
                </div>
            </div>
        )
    }
}
var ceil = Math.ceil;

Object.defineProperty(Array.prototype, 'chunk', {value: function(n) {
    return Array(ceil(this.length/n)).fill().map((_,i) => this.slice(i*n,i*n+n));
}});

class SynonymList extends React.PureComponent{
    constructor(props){
        super(props);
    }
    handleCardClick = (word) => {
        return (e) => {
            e.preventDefault();
            if(checkThesaurus) console.log('word clicked: ' + word)
            if(document.activeElement == window.getSelection().anchorNode.firstChild){
                const ta = document.activeElement;
                if(checkThesaurus)  console.log(ta.selectionStart, ta.selectionEnd)
                this.props.onSelReplace(ta.selectionStart, ta.selectionEnd, word);
                
                
            }
        }
    }
    render(){
        if( checkThesaurus) console.log(this.props)
        const words = 75;
        const cols = 10;
        const filler = (new Array(cols - words%cols)).join('.').split('.');
        return (
            <div>
                <div className="columns is-multiline">
                {this.props.synonyms.map((word,i)=>{
                    const replacedWord = this.props.abbrReplacer(word);
                    const otherAbbrs = this.props.abbrDict[word];
                    return (
                        <div className='card column is-narrow ' key={i}>
                            <div className='card-content is-paddingless' >
                                <Synonym word={word} 
                                abbr={replacedWord==word ? "" : replacedWord} 
                                otherAbbrs={otherAbbrs}/>
                                
                                <a className="icon is-small" onMouseDown={this.handleCardClick(word)}>
                                    <i className="fas fa-plus fa-xs" style={{color: "#51cf66"}} aria-hidden="true"></i>
                                </a>
                               

                            </div>
                        </div>
                    )}
                )}
                </div>
            </div>
        )
        /*
        return (
                <div>
                    {this.props.synonyms.concat(filler).chunk(cols).map((words,i)=>{          
                        return (
                            <div className="columns is-multiline" key={i}>
                                {words.map((word,j)=>{
                                    const replacedWord = this.props.abbrReplacer(word);
                                    const otherAbbrs = this.props.abbrDict[word];
                                    return (
                                        <div className='card column is-narrow' key={j}>
                                            <div className='card-content is-paddingless	'>
                                                <Synonym word={word} 
                                                abbr={replacedWord==word ? "" : replacedWord} 
                                                otherAbbrs={otherAbbrs}/>
                                            </div>
                                        </div>
                                        
                                    )}
                                )}
                            </div> 
                        )}
                    )}
                </div>
        );
        */
    }
}
class Synonym extends React.PureComponent{
    render(){
        //don't forget! you need to add capability to check on disabled abbreviations
        let mainAbbrDisp = '';
        if(this.props.abbr){
            mainAbbrDisp = <span style={{fontWeight: "bold"}}> 
                            {" (" + this.props.abbr + ")"}
                        </span>;
        }
        
        let enabledAbbrDisp = ''
        let disabledAbbrDisp = ''

        if(this.props.otherAbbrs){
            if(this.props.otherAbbrs.enabled){
                let enabledAbbrs = this.props.otherAbbrs.enabled.filter((abbr)=>{
                    return abbr!=this.props.abbr;
                });
                if(enabledAbbrs.length>0){
                    enabledAbbrDisp = <span style={{fontStyle:"italic"}}>
                                        {" (" + enabledAbbrs.join(',') + ")"}
                                    </span>
                }
            }
            
            if(this.props.otherAbbrs.disabled){
                let disabledAbbrs = this.props.otherAbbrs.disabled;
                if(disabledAbbrs.length>0){
                    disabledAbbrDisp = <span style={{fontStyle:"italic"}}>
                                            {" (" + disabledAbbrs.join(',') + ")"}
                                        </span>
                }
            }
        }
        return(
            <span>
                <span>{this.props.word}</span>
                {mainAbbrDisp}
                {enabledAbbrDisp}
                {disabledAbbrDisp}
            </span>
        )
    }
}
