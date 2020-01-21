
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
class Bullet extends React.PureComponent{
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
        if(checkEditor) console.log(this.ref)
        this.fixHeight();
    }
    fixHeight = () => {

        this.ref.current.style.height = 'auto';
        this.ref.current.style.height = Math.max(this.ref.current.scrollHeight, this.props.minHeight) + 'px';
        if( checkEditor) console.log('input box height adjusted')
    }
    componentDidMount(){
        this.fixHeight();
        if( checkEditor) console.log('text editor mounted')
    }
    componentDidUpdate(prevProps){
        if(checkEditor) console.log('text editor updated')
        
        this.fixHeight();
        if(this.props.textSelRange.trigger != prevProps.textSelRange.trigger){
            if(checkThesaurus || checkEditor) console.log('new selection range: ', this.props.textSelRange)
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
        if(prevProps.bullets.map(prevProps.abbrReplacer).join('') != newAbbrBullets.join('')){
            this.setState({
                abbrBullets: newAbbrBullets,
            });
        }
    }
    selectOutput = (e)=>{
        if(e.ctrlKey && e.keyCode == 65){
            e.preventDefault();
            //clog('control-a')
            //clog(this.outputRef.current)
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
                    if(checkAbbrs) console.log("key for optim bullet", key, this.props)
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
        if(checkOptims) console.log('height adjustment is mounting')
        if(this.state.checkingHeight){
            if(checkOptims) console.log('height adjustment after mount: ', this.bulletRef.current)
            if(checkOptims) console.log('height adjustment evaluated height: ', this.bulletRef.current.evaluate())
            const newHeight = this.bulletRef.current.evaluate().height;
            const newHeightSetting = newHeight==0? 'inherit':newHeight+'px';
            this.setState({
                height:newHeightSetting,
                checkingHeight: false,
            })
   
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(checkOptims) console.log('height adjustment updated',prevProps, this.props, prevState,this.state)
        if(prevProps.rawText != this.props.rawText){
            this.setState({
                checkingHeight: true,
            })
        }else{
            if(this.state.checkingHeight){
                if(checkOptims) console.log('new calculated height: ', this.bulletRef.current.evaluate())
                const newHeight = this.bulletRef.current.evaluate().height;
                const newHeightSetting = newHeight==0? 'inherit':newHeight+'px';
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
        if( false) console.log("constructed: " + this.state.text)
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
            if( checkOptims) console.log('no optimization done because it is disabled')
            this.setState({
                text: this.props.text,
                status: BULLET.NOT_OPT,
                loading:false
            })
        }else if(this.optimExists()){
            if( checkOptims) console.log('optimization already exists for ' + sentence)
            if(checkOptims) console.log(this.props.optims[sentence][this.props.width])
            this.setState({
                text: this.props.optims[sentence][this.props.width].result,
                status: this.props.optims[sentence][this.props.width].status,
                loading:false
            });
        
        }else{
            this.setState({
                loading:true
            })
            if( checkOptims) console.log('Optimization loading for ' + sentence)
            this.bufferedOptimize(500);
        }
    }
   
    bufferedOptimize = (delay) => { 
        if(this.state.updating && this.state.loading){
            clearTimeout(this.state.updating)
        }
        this.setState({
            updating: setTimeout(()=>{
                this.optimize();
                this.setState({
                    updating:null,
                    loading:false,
                });
            }, delay),
        })
    }
    bufferedUpdate = (delay) => { 
        if(this.state.updating){
            clearTimeout(this.state.updating)
        }
        this.setState({
            updating: setTimeout(()=>{
                this.update();
                this.setState({
                    updating:null,
                    loading:false,
                });
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
        }).then(()=>{if(checkOptims) console.log("optimization finished")})
        
    }
    optimizer = () =>{
        return new Promise((res)=>{
            //clog(ref)
            //clog(this.evaluate(bullet))
            const bulletRef = this.bulletRef.current;
            if(bulletRef == null) return;
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
            const newSpace = (initResults.direction == BULLET.ADD_SPACE)? largerSpace: smallerSpace;
            
            if( checkOptims) console.log('Sentence: ' + origSentence, initResults)
        
            function getRandomInt(seed,max){
                return Math.floor( Math.abs((Math.floor(9*seed.hashCode()+5) % 100000) / 100000) * Math.floor(max));
            }
            

            //if the sentence is blank, do nothing.
            if(! origSentence.trim()){
                finalResults.optimization.status = BULLET.OPTIMIZED;
            } else{

                while(finalResults.optimization.status != BULLET.OPTIMIZED){
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
                    if(initResults.direction == BULLET.ADD_SPACE && newResults.direction == BULLET.REM_SPACE){            
                        //console.log("Note: Can't add more spaces without overflow, reverting to previous" );
                        finalResults.optimization = prevResults.optimization;
                        break;
                    } else if(initResults.direction == BULLET.REM_SPACE && newResults.direction == BULLET.ADD_SPACE){
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
        if(checkOptims) {
            console.log('component updated. previous: ' + prevProps.text)
            console.log('to ' + this.props.text)
        }
    }
    componentDidMount(){
        if( checkOptims) console.log('component mounted for ' + this.state.text)
        if( false) console.log(this.state)
        this.update();
        this.setState({height: this.props.height})

    }
    
    componentWillUnmount(){
        if( checkOptims) console.log('component unmounted ')
        clearTimeout(this.state.updating)
    }

    render(){
        if( checkOptims) console.log('component rendering: ', escape(this.state.text))
        let newColor = "inherit";
   
        if(this.state.loading){
            newColor = "gray"
        }else if(this.state.status == BULLET.FAILED_OPT){
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
        if(selection != ""){
            this.props.onSelect(selection);
        }else if(e.target.selectionStart){
            //this hack is for microsoft edge, which sucks at window.getSelection()
            const textAreaSelection = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
            if( false) console.log("selection: " + textAreaSelection);
            this.props.onSelect(textAreaSelection);
        }
    }
    render() {
        if( checkOptims) console.log('rendering bullet comparator')
        if( checkOptims) console.log(this.state)
        if( checkOptims) console.log(this.props)
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

