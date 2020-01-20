const checkThesaurus = false;
class SynonymViewer extends React.PureComponent{
    constructor(props){
        super(props)
        this.state={
            synonyms:[],
            hidden:true,
        }
    }
    getSynonyms = (phrase)=>{
        clog('finding synonyms for '+ phrase, checkThesaurus);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange =  () => {
            if(xhttp.readyState == 4 && xhttp.status == 200){
                const dat = JSON.parse(xhttp.responseText);
                clog(dat,checkThesaurus);
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
        clog('componentDidMount getting synonyms for ' + this.props.word, checkThesaurus)
        this.getSynonyms(this.props.word);
    }
    componentDidUpdate(prevProps){
        if(prevProps.word != this.props.word){
            clog("componentDidUpdate getting synonyms for " + this.props.word, checkThesaurus)
            this.getSynonyms(this.props.word);
        }
    }
    toggleHidden = () => {
        const hiddenState = this.state.hidden;
        this.setState({hidden: !hiddenState});
    }
    render(){
        const replacedWord = this.props.abbrReplacer(this.props.word);
        const otherAbbrs = this.props.abbrDict[this.props.word];
        const header = <Synonym word={this.props.word} key={this.props.word}
                            abbr={replacedWord==this.props.word ? "" : replacedWord} 
                            otherAbbrs={otherAbbrs}/>
        const synonyms =  <SynonymList key={this.state.synonyms.join('')} synonyms={this.state.synonyms} abbrDict={this.props.abbrDict} abbrReplacer={this.props.abbrReplacer} />;
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
                <header className="card-header has-background-light	is-shadowless" onClick={this.toggleHidden}>
                    <a className="card-header-title" >
                        <span style={{marginRight:'5px'}}>Thesaurus{this.props.word==''?'':":"}</span>
                        {header} 
                    </a>
                    <a className="card-header-icon" >
                        <span className="icon">
                            <i className="fas fa-angle-down" aria-hidden="true"></i>
                        </span>
                    </a>
                </header>
                <div className={"card-content" + ' ' + (this.state.hidden? "is-hidden":'')} style={{height:"250px", overflow:"auto"}} >
                    
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
    render(){
        clog(this.props, checkThesaurus)
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
                            <div className='card-content is-paddingless	'>
                                <Synonym word={word} 
                                abbr={replacedWord==word ? "" : replacedWord} 
                                otherAbbrs={otherAbbrs}/>
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
