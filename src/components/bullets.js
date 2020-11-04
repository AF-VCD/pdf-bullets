import React from "react"
import {Editor, EditorState, RichUtils, CompositeDecorator, Modifier, SelectionState} from "draft-js"
import "draft-js/dist/Draft.css";
const DPI = 96;
const MM_PER_IN = 25.4;
const DPMM = DPI / MM_PER_IN;

const testText = 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii'

//make sure regexes defined here are global, or else findWithRegex() will break
const abbr_regex = /evaluated/g;
const abbrs = {
    'evaluated': 'eval\'d'
};
function findWithRegex(regex, contentBlock, callback){
    const text = contentBlock.getText();
    let matchArr, start;

    // wow, the draftjs tweet example has some fancy syntax here. basically 
    //  assignment of matchArr happens inside the conditional check and it's available in the loop as well
    while((matchArr = regex.exec(text)) !== null){
        start = matchArr.index;
        // can see here that callback is called on the start and end indices of the text in the content block.. I think
        
        callback(start, start+matchArr[0].length);
    }
}

function findAbbrEntities(contentBlock, callback, contentState) {
    
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        
        return (
          entityKey !== null &&
          contentState.getEntity(entityKey).getType() === 'ABBR'
        );
      },
      callback
    );
  }


const Abbr = (props)=>{
    const {abbr} = props.contentState.getEntity(props.entityKey).getData();
    
    return (
        <span >
            <span style={{color:'red'}} >{abbr}</span>
            <span data-offset-key={props.offsetKey}  style={{display:'none'}} >
            
                {props.children}
            </span>
        </span>
    )
}

var draftjscontent;

function Skeleton(){
    
    const [text, setText] = React.useState(testText);

    const compositeDecorator = new CompositeDecorator([
        {
            strategy: findAbbrEntities,
            component: Abbr,
        }
    ])


    const [editorState, setEditorState] = React.useState(()=>
        EditorState.createEmpty(compositeDecorator),
    );

    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if(newState){
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    const onChange = (editorState)=>{
        setEditorState(editorState);
        const content = editorState.getCurrentContent();
        const blockMap = content.getBlockMap();
        // ordered map has a key and a block associasted with it
        /*
        for(let [key,block] of blockMap){
            console.log(block.getText());
        }
        */
        
        
        
        for(let [key,block] of blockMap){
            const createNewEntity= (start,end)=>{
                const selState = SelectionState.createEmpty(key);
                const updatedSelection = selState.merge({
                    anchorKey : key,
                    anchorOffset: start,
                    focusKey: key,
                    focusOffset: end
                });
                const contentWithEntity = content.createEntity('ABBR','IMMUTABLE',{abbr: 'eval\'d'});
                const entityKey = contentWithEntity.getLastCreatedEntityKey();
                const contentStateWithAbbr = Modifier.applyEntity(
                    contentWithEntity,
                    updatedSelection,
                    entityKey
                );
                const newEditorState = EditorState.set(editorState,{currentContent:contentStateWithAbbr});
                setEditorState(newEditorState);
                
            }
            findWithRegex(abbr_regex,block,createNewEntity)
        }
        /*
        const contentStateWithAbbr = Modifier.applyEntity(
            contentWithEntity,
            SelectionState.createEmpty('asdf'),
            entityKey
        )
        setEditorState(editorState, {currentContent: contentStateWithAbbr});
            
            */
        setText(content.getPlainText('\n'));
    }


    return (<>
        <Editor editorState={editorState} onChange={onChange} handleKeyCommand={handleKeyCommand}/>
        {text.split('\n').map((row)=>{
            return <Bullet text={row} width={202.321*DPMM}/>
        })}
        </>);
}
//


function Bullet(props){
    const canvasRef = React.useRef(null);
    const [results, setResults] = React.useState('');
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        //now we can draw in 2d here.
        context.font = '12pt AdobeTimes';
        //context.fillText(props.text, 50,50);
        setResults(evaluator(props.text, context, props.width))
    }, [props.text]);
    // [] indicates that this happens once after the component mounts.
    // [props.text] indicates that this happens every time the text changes.
    
    // the style properties help lock the canvas in the same spot and make it essentially invisible.
    const canvas = <canvas 
        ref={canvasRef} 
        style={{
            visibility:"hidden", 
            position:"absolute",
            top:"0px",
            left: "0px"   
        }}/>;

    //whitespace: pre-wrap is essential as it allows javascript string line breaks to appear properly.
    return (
        <>
        {canvas}
        <div style={{whiteSpace:'pre-wrap'}}>
        {results}
        </div>
        </>
    );
    //return canvas;
}

// all widths in this function are in pixels
function evaluator(text, context, width){
    
    const getWidth = (txt)=> (context.measureText(txt)).width;
    const fullWidth = getWidth(text);
    if(fullWidth < width){
        return text;
    }else{
        // Regex- split after one of the following: \s ? / | - % ! 
        // but ONLY if immediately followed by: [a-zA-z] [0-9] + \
        const textSplit = text.split(/(?<=[ \?\/\|\-\%\!])(?=[a-zA-Z0-9\+\\])/) ;
        
        if(textSplit.length > 1){
            let answerIdx = 0;
            for(let i = 1; i <= textSplit.length; i++){
                const evalText = textSplit.slice(0,i).join('').trimEnd();
                const evalWidth = getWidth(evalText);
                if(evalWidth > width){
                    answerIdx = i - 1;
                    break;
                }
            }
            
            return textSplit.slice(0,answerIdx).join('') + '\n' + evaluator(textSplit.slice(answerIdx,textSplit.length).join(''), context, width)
        }else{
            const avgCharWidth = fullWidth/(text.length);
            const guessIndex = parseInt(width / avgCharWidth);
            const firstGuessWidth = getWidth(text.substring(0,guessIndex)) 
            let answerIdx = guessIndex;
            if(firstGuessWidth > width){
                for(let i=guessIndex-1; i>0; i--){
                    const nextGuessWidth = getWidth(text.substring(0,i));
                    if(nextGuessWidth < width){
                        answerIdx = i;
                        break;
                    }
                }
            }else if(firstGuessWidth < width){
                for(let i=guessIndex; i <= text.length; i++){
                    
                    const nextGuessWidth = getWidth(text.substring(0,i));
                    if(nextGuessWidth > width){
                        answerIdx = i - 1;
                        break;
                    }
                }
            }
            
            return text.substring(0,answerIdx) + '\n' + evaluator(text.substring(answerIdx,text.length), context, width)
        }
    }
}

// optimization status codes
// status codes for optimization direction 
// had to move this to a floating object because MS Edge doesn't support static variables
const BULLET = {
    OPTIMIZED: 0,
    FAILED_OPT: 1,
    NOT_OPT: -1,
    ADD_SPACE: 1,
    REM_SPACE: -1,
    MAX_UNDERFLOW: -4
}
class BulletOld extends React.PureComponent{
    constructor(props){
        super(props);
        this.renderRef = React.createRef();
    }
    render(){
        return(
            <div style={{width: this.props.width, height:this.props.height}} onMouseUp={this.props.onHighlight} >
                <span className={this.props.class} style={this.props.style} ref={this.renderRef} >
                    {this.props.text}
                </span>
            </div>
        );
    }
    static Tokenize (sentence) {
        return sentence.split(/[\s]+/);
    }
    static Clean(sentence){
        return Bullet.Tokenize(sentence).join(' ');
    }    // Tweak and Untweak are used to fix some miscellaneous PDF-vs-HTML formatting problems
    static Tweak(sentence){    
        // adds a 0-width space (\u200B) after forward slashes to cause them to wrap
        sentence =  sentence.replace(/(\w)\//g,'$1/\u200B');
        
        // adds a non-breaking dash (\u2011) instead of a dash to prevent wrapping
        sentence =  sentence.replace(/-/g,'\u2011');
        return sentence;
    }
    
    static Untweak(sentence){
        sentence =  sentence.replace(/[\u200B]/g,'');
        sentence =  sentence.replace(/[\u2011]/g,'-');
        return sentence;
    }
    evaluate = () => {
        const dispNode = this.renderRef.current;
        //console.log('height adjustment info: ',this.renderRef.current, this.renderRef.current.getBoundingClientRect())
        dispNode.style.whiteSpace = "nowrap";
        const parentWidth = dispNode.parentNode.getBoundingClientRect().width;
        const singleWidth = dispNode.getBoundingClientRect().width;
        
        //This checks to see what the single line height of the ref nodeis.
        const singleHeight = dispNode.getBoundingClientRect().height;
        //console.log(singleHeight);

        // This makes the node go back to normal wrapping, and we can run getBoundingClientRect() 
        //  again to see the height again
        dispNode.style.whiteSpace = "pre-wrap";
        dispNode.style.wordBreak = "break-word";

        const trueHeight = dispNode.getBoundingClientRect().height;
        //dispNode.style.wordBreak = 'inherit';
        const overflow = (singleWidth - parentWidth);
    
        const madeNewLine = trueHeight > singleHeight;
        
        let results = {
            "optimization": {
                "sentence": this.props.text,
                "status":false,
            },
            "direction": false,
            "height": trueHeight,
        }

        // you may be wondering, 'why do you have to check width and height? couldn't you 
        //  just check to see if overflow is greater than or less than 0? You would think so,
        //  but there are cases where the browser will fit a wider element into a smaller one,
        //  WITHOUT wrapping the line... 
        if(madeNewLine){
            results.direction = BULLET.REM_SPACE;
        }else{
            results.direction = BULLET.ADD_SPACE;
        }

        if(overflow > BULLET.MAX_UNDERFLOW && ! madeNewLine){
            results.optimization.status = BULLET.OPTIMIZED;
        }else {
            results.optimization.status = BULLET.FAILED_OPT;
        }
        return results;
    }
}

class BulletEditor extends React.PureComponent{
    constructor(props){
        super(props);
        this.ref = React.createRef();
    }
    handleChange = (e) => {
        this.props.handleTextChange(e)
        this.fixHeight();
    }
    handleInput = (e) => {
        
        this.fixHeight();
    }
    fixHeight = () => {

        this.ref.current.style.height = 'auto';
        this.ref.current.style.height = Math.max(this.ref.current.scrollHeight, this.props.minHeight) + 'px';
        
    }
    componentDidMount(){
        this.fixHeight();
        
    }
    componentDidUpdate(prevProps){
        
        
        this.fixHeight();
        if(this.props.textSelRange.trigger !== prevProps.textSelRange.trigger){
            
            let start, end;
            if(this.props.textSelRange.start < this.props.textSelRange.end){
                start = this.props.textSelRange.start;
                end = this.props.textSelRange.end;
            }else{
                start = this.props.textSelRange.end;
                end = this.props.textSelRange.start;
            }
            this.ref.current.setSelectionRange(start, end)
        }
        

    }
    render(){
        return (
            <div className="border" >
                <textarea 
                    ref={this.ref}
                    onChange={this.handleChange} 
                    value={this.props.text} 
                    onInput={this.handleInput}
                    style={{
                        width: this.props.width,
                        maxHeight: "unset",
                    }}
                    onMouseUp={this.props.onHighlight}
                    onKeyUp={this.props.onHighlight}
                    
                    className="bullets textarea is-paddingless is-marginless"></textarea>
            </div>
        )
    }
}
//how do i get lines to line up between the output and editor?
class BulletOutputViewer extends React.PureComponent{
    constructor(props){
        super(props);
        this.outputRef = React.createRef();
        this.state = {
            abbrBullets: this.props.bullets.map(this.props.abbrReplacer)
        };
    }
    componentDidUpdate(prevProps,prevState){
        const newAbbrBullets = this.props.bullets.map(this.props.abbrReplacer);
        if(prevProps.bullets.map(prevProps.abbrReplacer).join('') !== newAbbrBullets.join('')){
            this.setState({
                abbrBullets: newAbbrBullets,
            });
        }
    }
    selectOutput = (e)=>{
        if(e.ctrlKey && e.keyCode === 65){
            e.preventDefault();
            //console.log('control-a')
            //console.log(this.outputRef.current)
            if (window.getSelection) { 
                const range = document.createRange();
                range.selectNode(this.outputRef.current);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            }
        }
    }
    handleCopy = (e)=>{
        
        let text = Bullet.Untweak(window.getSelection().toString())
        //console.log('Copy event: ' + text)
        text = text.replace(/\n/g,'\r\n'); //need this for WINDOWS!
        //console.log('Copy event: ' + text)
        e.clipboardData.setData('text/plain',text);
        e.preventDefault();
    }
    render(){
        const keyDict = {};
        return (
            <div className="border" tabIndex="1" 
                onKeyDown={this.selectOutput} 
                onKeyUp={this.props.onHighlight} 
                ref={this.outputRef}
                onCopy={this.handleCopy}>
                {this.props.bullets.map(
                (line,i)=>{
                    const key = this.state.abbrBullets[i] + this.props.width + this.props.enableOptim;
                    
                    if(key in keyDict){
                        keyDict[key] += 1;
                    }else{
                        keyDict[key] = 1;
                    }
                    return <HeightAdjustedBullet text={this.state.abbrBullets[i] || ''} 
                        rawText={line}
                        width={this.props.width}
                        key={key + keyDict[key]} 
                        optims={this.props.optims}
                        onOptim={this.props.onOptim}
                        optimizer={this.props.optimizer}
                        enableOptim={this.props.enableOptim}
                        onHighlight={this.props.onHighlight}
                        abbrReplacer = {this.props.abbrReplacer}
                        />
                })}
            </div>
        )
    }

}
class HeightAdjustedBullet extends React.PureComponent{
    constructor(props){
        super(props);
        this.bulletRef = React.createRef();
        this.state = {
            checkingHeight : true,
            height: 'unset',
        }
    }
    componentDidMount(){
        
        if(this.state.checkingHeight){
            
            const newHeight = this.bulletRef.current.evaluate().height;
            const newHeightSetting = newHeight===0? 'inherit':newHeight+'px';
            this.setState({
                height:newHeightSetting,
                checkingHeight: false,
            })
   
        }
    }
    componentDidUpdate(prevProps, prevState){
        
        if(prevProps.rawText !== this.props.rawText){
            this.setState({
                checkingHeight: true,
            })
        }else{
            if(this.state.checkingHeight){
                
                const newHeight = this.bulletRef.current.evaluate().height;
                const newHeightSetting = newHeight===0? 'inherit':newHeight+'px';
                this.setState({
                    checkingHeight: false,
                    height: newHeightSetting,
                })
            }
        }
    }
    render(){
            let bullet;
            if(this.state.checkingHeight){
                bullet = (
                    <Bullet text={Bullet.Tweak(this.props.rawText)} 
                        ref={this.bulletRef}
                        width={this.props.width} 
                        onHighlight={this.props.onHighlight}
                        class='bullets optimized' 
                        style={{
                            display:'inline-block',
                            wordBreak:'break-word',
                        }}
                    />
                )
            }else{
                bullet = (
                    <OptimizedBullet text={this.props.text} 
                        width={this.props.width}
                        height={this.state.height} 
                        optims={this.props.optims}
                        onOptim={this.props.onOptim}
                        optimizer={this.props.optimizer}
                        enableOptim={this.props.enableOptim}
                        onHighlight={this.props.onHighlight}
                        abbrReplacer = {this.props.abbrReplacer}
                        />
                )
            }
            return ( <div>{bullet} </div>);
        
    }
}
class OptimizedBullet extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {
            text: this.props.text,
            loading: true,
            updating: null,
            status: BULLET.NOT_OPT,
            height:'unset',
        }

        this.bulletRef=React.createRef();
    }
    optimExists = () => {
        if(this.props.optims[this.state.text] && this.props.optims[this.state.text][this.props.width]){
            return true
        }else{
            return false
        }
    }
    update = () => {
        const sentence = this.state.text;
        if(!this.props.enableOptim){
            
            this.setState({
                text: this.props.text,
                status: BULLET.NOT_OPT,
                loading:false
            })
        }else if(this.optimExists()){
            
            this.setState({
                text: this.props.optims[sentence][this.props.width].result,
                status: this.props.optims[sentence][this.props.width].status,
                loading:false
            });
        
        }else{
            this.setState({
                loading:true
            })

            this.bufferedOptimize(500);
        }
    }
   
    bufferedOptimize = (delay) => { 
        if(this.state.updating && this.state.loading){
            clearTimeout(this.state.updating)
        }
        this.setState({
            updating: setTimeout(()=>{
                this.optimize().then(() => {
                    this.setState({
                        updating:null,
                        loading:false,
                    });
                })
                
            }, delay),
        })
    }
    optimize = () => {
        const sentence = Bullet.Clean(this.state.text);

        return this.optimizer().then((optimization) => {
            // send optim back to global dictionary to update it
            this.props.onOptim({
                "sentence":sentence,
                "width": this.props.width,
                "optimized": optimization.sentence,
                "status": optimization.status,
            });
            return optimization;
        }).then((optimization) => {
            this.setState({
                text:optimization.sentence,
                status: optimization.status,
                loading:false,
            })
        });
        
    }
    optimizer = () =>{
        return new Promise((res)=>{
            //console.log(ref)
            //console.log(this.evaluate(bullet))
            const bulletRef = this.bulletRef.current;
            if(bulletRef === null) return;
            const smallerSpace = "\u2006";
            const largerSpace = "\u2004";

            const origSentence = 
                Bullet.Clean(
                    this.props.text 
                )

            //initialization of optimized words array
            let optWords = Bullet.Tokenize(origSentence);
            
            const initResults = bulletRef.evaluate();
            this.setState({
                text: origSentence
            })
            
            
            
            //initial instantiation of previousResults
            let prevResults = initResults;
            let finalResults = initResults;
            const newSpace = (initResults.direction === BULLET.ADD_SPACE)? largerSpace: smallerSpace;
            
            
        
            function getRandomInt(seed,max){
                return Math.floor( Math.abs((Math.floor(9*seed.hashCode()+5) % 100000) / 100000) * Math.floor(max));
            }
            

            //if the sentence is blank, do nothing.
            if(! origSentence.trim()){
                finalResults.optimization.status = BULLET.OPTIMIZED;
            } else{

                while(finalResults.optimization.status !== BULLET.OPTIMIZED){
                    //don't select the first space after the dash- that would be noticeable and look wierd.
                    // also don't select the last word, don't want to add a space after that.
                    let iReplace = getRandomInt(optWords.join(''), optWords.length -1 -1) + 1;
                    
                    //merges two elements together, joined by the space
                    optWords.splice( 
                        iReplace, 2, 
                        optWords.slice(iReplace,iReplace+2).join(newSpace)
                    );
            
                    //make all other spaces the normal space size
                    let newSentence = optWords.join(' ');
                    this.setState({
                        text: newSentence
                    })
                    // check to see how sentence fits
                    let newResults = bulletRef.evaluate();
                    //console.log(newResults)
                    if(initResults.direction === BULLET.ADD_SPACE && newResults.direction === BULLET.REM_SPACE){            
                        //console.log("Note: Can't add more spaces without overflow, reverting to previous" );
                        finalResults.optimization = prevResults.optimization;
                        break;
                    } else if(initResults.direction === BULLET.REM_SPACE && newResults.direction === BULLET.ADD_SPACE){
                        //console.log("Removed enough spaces. Terminating." );
                        finalResults.optimization = newResults.optimization;
                        break;
                    } else if(optWords.length <= 2){ //this conditional needs to be last
                        //console.log("\tWarning: Can't replace any more spaces");
                        finalResults.optimization = newResults.optimization;
                        break;
                    }
                    prevResults = newResults;
                } 
            } 

            res(finalResults.optimization)
        })
    };
    componentDidUpdate(prevProps){

    }
    componentDidMount(){  
        this.update();
        this.setState({height: this.props.height})

    }
    
    componentWillUnmount(){
        clearTimeout(this.state.updating)
    }

    render(){

        let newColor = "inherit";
   
        if(this.state.loading){
            newColor = "gray"
        }else if(this.state.status === BULLET.FAILED_OPT){
            newColor = "red"
        }
        

        return (
            <Bullet text={Bullet.Tweak(this.state.text)} 
                ref={this.bulletRef}
                width={this.props.width} 
                onHighlight={this.props.onHighlight}
                class='bullets optimized' 
                style={{
                    color: newColor,
                    display:'inline-block',
                    wordBreak:'break-word',
                }}
                height={this.state.height}/>
        )
    }

}
class BulletComparator extends React.PureComponent {
    constructor(props){
        super(props);
        
        this.state = { 
            enableOptim: true,
            optims: {}
        };

    }
    
    updateOptims = (params) => {
        this.setState((state) => {
            state.optims[params.sentence] = state.optims[params.sentence] || {};
            state.optims[params.sentence][params.width] = {
                result: params.optimized,
                status: params.status
            };
            return state
        });
    }

    handleTextChange = (e) => {
        this.setState({
            text: e.target.value,
        });
    }
    handleSelect = (e) =>{
        if( false) console.log('selection registered in reactBullets')
        const selection = window.getSelection().toString();
        if(selection !== ""){
            this.props.onSelect(selection);
        }else if(e.target.selectionStart){
            //this hack is for microsoft edge, which sucks at window.getSelection()
            const textAreaSelection = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
            if( false) console.log("selection: " + textAreaSelection);
            this.props.onSelect(textAreaSelection);
        }
    }
    render() {

        return (
            <div className="columns is-multiline">
                <div className="column is-narrow">
                <h2 className='subtitle'>Input Bullets Here:</h2>
                <BulletEditor 
                    textSelRange={this.props.textSelRange}
                    text={this.props.text} 
                    handleTextChange={this.props.handleTextChange} 
                    width={this.props.width}
                    onHighlight={this.handleSelect}
                    minHeight={100}/>
                </div>
                <div className="column is-narrow">
                <h2 className='subtitle'>View Output Here:</h2>
                <BulletOutputViewer bullets={this.props.text.split('\n')} 
                    abbrReplacer={this.props.abbrReplacer}
                    width={this.props.width} 
                    optims={this.state.optims} 
                    enableOptim={this.props.enableOptim} 
                    optimizer={this.optimizer}
                    onOptim={this.updateOptims}
                    onHighlight={this.handleSelect}/>
                </div>
            </div>
        );
    }
}

export {Bullet, BulletComparator, evaluator, Skeleton};