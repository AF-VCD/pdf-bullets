const checkThesaurus = false;
class SynonymViewer extends React.PureComponent{
    constructor(props){
        super(props)
        this.state={
            synonyms:[]
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
    render(){
        const replacedWord = this.props.abbrReplacer(this.props.word);
        const otherAbbrs = this.props.abbrDict[this.props.word];
        return (
            <div id='thesaurus'>
                <Synonym word={this.props.word} 
                            abbr={replacedWord==this.props.word ? "" : replacedWord} 
                            otherAbbrs={otherAbbrs}/>
                <SynonymList synonyms={this.state.synonyms} abbrDict={this.props.abbrDict} abbrReplacer={this.props.abbrReplacer}/>
            </div>
        )
    }
}
class SynonymList extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        clog(this.props, checkThesaurus)
        
        return (
            <ul>
            { this.props.synonyms.map((word, i)=>{
                const replacedWord = this.props.abbrReplacer(word);
                const otherAbbrs = this.props.abbrDict[word];
                return (
                    <li key={i}>
                        <Synonym word={word} 
                            abbr={replacedWord==word ? "" : replacedWord} 
                            otherAbbrs={otherAbbrs}/>
                    </li>
                );
            }) }
            </ul>
        )
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
            <div style={{display:"inline"}}>
                <span>{this.props.word}</span>
                {mainAbbrDisp}
                {enabledAbbrDisp}
                {disabledAbbrDisp}
            </div>
        )
    }
}
