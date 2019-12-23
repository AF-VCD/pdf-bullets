const checkThesaurus = true;
class SynonymViewer extends React.PureComponent{
    constructor(props){
        super(props)
        this.state={
            synonyms:[]
        }
    }
    getSynonyms = (phrase)=>{
        clog('finding synonyms for '+ phrase);
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange =  () => {
            if(xhttp.readyState == 4 && xhttp.status == 200){
                const dat = JSON.parse(xhttp.responseText);
                clog(dat,checkThesaurus);
                if(dat.length != 0){
                    this.setState({
                        synonyms: dat.map((item)=>{return item.word}),
                    });
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
        return (
            <div>
                <SynonymList synonyms={this.state.synonyms} abbrDict={this.props.abbrDict}/>
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
                return (
                    <li key={i}>
                        <Synonym text={word} abbr={this.props.abbrDict[word]} />
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
        return(
            <div style={{display:"inline"}}>
                <span>{this.props.text}</span>
                {
                    this.props.abbr? (
                        <span style={{fontWeight: "bold"}}> 
                        {" (" + this.props.abbr + ")"}
                        </span>
                        ):""
                }
                
            </div>
        )
    }
}

function getThesaurus(){
    
    var sel = window.getSelection();
    
    //console.log(sel)
    if(sel.type != 'None' && (sel.anchorNode.id == 'bulletsBorder' || sel.anchorNode.parentNode.className == 'bullets')){
        
        var selString = sel.toString();
        
        //this stupid stuff is to fix MS Edge, because sel.toString doesn't work right for textareas.
        if(selString == '' && sel.anchorNode.nodeName != '#text'){
            var textAreaNode = sel.anchorNode.querySelector('textarea');
            selString = textAreaNode.value.substring(textAreaNode.selectionStart, textAreaNode.selectionEnd)
            //console.log('edge fix:' + selString)
        }
        //console.log('selected string: ' + selString)
        // limit phrase sent to API to 8 words. Should work fine if phrase is less than 8 words
        var maxWords = 8;
        var phrase = selString.trim().split(/\s+/).slice(0,maxWords).join(' ');
        
        if(phrase){
            console.log('valid selection: ' + phrase);
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if(this.readyState == 4 && this.status == 200){
                    var dat = JSON.parse(this.responseText);
                    //console.log(dat);

                    document.querySelector('#thesaurus').innerHTML = ''
                    var phraseNode = document.createElement('div');
                    addWordWithAbbrs(phrase, phraseNode)
                    document.querySelector('#thesaurus').appendChild(phraseNode);
                    var list = document.createElement('ul');
                    document.querySelector('#thesaurus').appendChild(list);
                    // add original word thesarus display
                    
                    for (var i of dat){
                        var wordNode = document.createElement("li");
                        addWordWithAbbrs(i.word, wordNode)
                        list.appendChild(wordNode);
                    }

                    if(dat.length == 0){
                        document.querySelector('#thesaurus').innerText =  'no results found.'
                    }
                    
                }
            }

            xhttp.open("GET","https://api.datamuse.com/words?max=75&ml=" + phrase,true)

            xhttp.send();
            //loading text will be replaced when xhttp request is fulfilled
            document.querySelector('#thesaurus').innerText = 'loading...';
            


        }
    }
   
}