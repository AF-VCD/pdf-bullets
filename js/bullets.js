


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
    }
    render(){
        return(
            <div style={{width: this.props.width, height:this.props.height}} onMouseUp={this.props.onHighlight} >
                <span className={this.props.class} style={this.props.style} ref={this.props.renderRef} >
                    {this.props.text}
                </span>
            </div>
        );
    }
    static tokenize (sentence) {
        return sentence.split(/[\s]+/);
    }
    static clean(sentence){
        return Bullet.tokenize(sentence).join(' ');
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
        const dispNode = this.props.renderRef.current;

        dispNode.style.whiteSpace = "nowrap";
        const parentWidth = dispNode.parentNode.getBoundingClientRect().width;
        const singleWidth = dispNode.getBoundingClientRect().width;
        
        //This checks to see what the single line height of the ref nodeis.
        const singleHeight = dispNode.getBoundingClientRect().height;
        //console.log(singleHeight);

        // This makes the node go back to normal wrapping, and we can run getBoundingClientRect() 
        //  again to see the height again
        dispNode.style.whiteSpace = "inherit";
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
        clog(this.ref,checkEditor)
        this.fixHeight();
    }
    fixHeight = () => {
        this.ref.current.style.height = 'auto';
        this.ref.current.style.height = Math.max(this.ref.current.scrollHeight, this.props.minHeight) + 'px';
        clog('input box height adjusted', checkEditor)
    }
    componentDidMount(){
        this.fixHeight();
        clog('text editor mounted', checkEditor)
    }
    componentDidUpdate(){
        clog('text editor updated',checkEditor)
        this.fixHeight();
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
                    }}
                    onMouseUp={this.props.onHighlight}
                    onKeyUp={this.props.onHighlight}
                    
                    className="bullets"></textarea>
            </div>
        )
    }
}
//how do i get lines to line up between the output and editor?
class BulletOutputViewer extends React.PureComponent{
    constructor(props){
        super(props);
        this.outputRef = React.createRef();
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
        return (
            <div className="border" tabIndex="1" 
                onKeyDown={this.selectOutput} 
                onKeyUp={this.props.onHighlight} 
                ref={this.outputRef}
                onCopy={this.handleCopy}>
                {this.props.bullets.map(
                (line,i)=>{
                    const optimRef = React.createRef();
                    return <OptimizedBullet text={line} 
                        width={this.props.width}
                        key={i+this.props.abbrReplacer(line)+this.props.enableOptim} 
                        optims={this.props.optims}
                        onOptim={this.props.onOptim}
                        optimizer={this.props.optimizer}
                        enableOptim={this.props.enableOptim}
                        onHighlight={this.props.onHighlight}
                        abbrReplacer = {this.props.abbrReplacer}
                        ref={optimRef} 
                        optimRef={optimRef}
                        />
                })}
            </div>
        )
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
        this.ref = this.props.optimRef;
        this.bulletRef=React.createRef();
        this.renderRef=React.createRef(); //this is a reference to the actual tag inside bullet in which the text is placed
        clog("constructed: " + this.state.text, false)
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
            clog('no optimization done because it is disabled', checkOptims)
            this.setState({
                text: this.props.abbrReplacer(this.props.text),
                status: BULLET.NOT_OPT,
                loading:false
            })
        }else if(this.optimExists()){
            clog('optimization already exists for ' + sentence, checkOptims)
            clog(this.props.optims[sentence][this.props.width],checkOptims)
            this.setState({
                text: this.props.optims[sentence][this.props.width].result,
                status: this.props.optims[sentence][this.props.width].status,
                loading:false
            });
        
        }else{
            this.setState({
                loading:true
            })
            clog('Optimization loading for ' + sentence, checkOptims)
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
                this.update(this.state.text);
                this.setState({
                    updating:null,
                });
            }, delay),
        })
    }
    optimize = () => {
        const sentence = Bullet.clean(this.state.text);
        //clog(this.ref)
        return this.optimizer().then((optimization) => {
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
                loading:false
            })
        }).then(()=>{clog("optimization finished",checkOptims)})
        
    }
    optimizer = () =>{
        return new Promise((res)=>{
            //clog(ref)
            //clog(this.evaluate(bullet))
            const bulletRef = this.bulletRef.current;
            
            const smallerSpace = "\u2009";
            const largerSpace = "\u2004";

            const origSentence = 
                Bullet.clean(
                    this.props.abbrReplacer(this.props.text) 
                )
            

            //initialization of optimized words array
            let optWords = Bullet.tokenize(origSentence);


            const initResults = bulletRef.evaluate();
            this.setState({
                text: origSentence
            })
            
            //initial instantiation of previousResults
            let prevResults = initResults;
            let finalResults = initResults;
            const newSpace = (initResults.direction == BULLET.ADD_SPACE)? largerSpace: smallerSpace;
            
            clog('Sentence: ' + origSentence, checkOptims)
            //console.log(initResults)
            //console.log('\tspan node height: ' + spanNode.offsetHeight)
            //console.log('\tdesired height: ' + singleHeight)
        
        
            function getRandomInt(seed,max){
                return Math.floor( Math.abs((Math.floor(9*seed.hashCode()+5) % 100000) / 100000) * Math.floor(max));
            }
            

            //if the sentence is blank, do nothing.
            if(! origSentence.trim()){
                finalResults.optimization.status = BULLET.OPTIMIZED;
            } else{

                while(true){
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
    componentDidMount(){
        clog('component mounted for ' + this.state.text, checkOptims)
        clog(this.state, false)
        clog(this.ref, false)
        
        
        
        let origHeight;
        if(this.state.height == 'unset'){
            if(true){ //TODO implement enable-disable aligned output prop

                // on initial component creation, I want it to render once with original property text, so I can evaluate its original height.
                origHeight = this.bulletRef.current.evaluate().height;
                
            }else{
                origHeight = 'inherit';
            }
            
            // After creation and checking height, I want to initiate the state text with its abbreviations replaced, unless the user disables space optimization.
            this.setState({
                text: this.props.abbrReplacer(this.props.text)
            });
            
        }else{
            origHeight = this.sate.height;
        }
        
        //need to set height to inherit to make optimization work correctly.
        this.setState({
            height:'inherit',
        })

        this.update();
        

        clog('height: '+origHeight, checkOptims)
        // need to set state after update/optimization, because the height of the bullet makes the optimization not work correctly.
        this.setState({
            height: origHeight? origHeight+'px':'inherit',
        });
    }
    componentWillUnmount(){
        clog('component unmounted ', checkOptims)
        clearTimeout(this.state.updating)
    }

    render(){
        clog('component rendering: '+ this.state.text, checkOptims)
        let newColor = "inherit";
   
        if(this.state.loading){
            newColor = "gray"
        }else if(this.state.status == BULLET.FAILED_OPT){
            newColor = "red"
        }
        

        return (
            <Bullet text={Bullet.Tweak(this.state.text)} 
                ref={this.bulletRef}
                renderRef={this.renderRef}
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
        clog('selection registered in reactBullets', false)
        const selection = window.getSelection().toString();
        if(selection != ""){
            this.props.onSelect(selection);
        }else if(e.target.selectionStart){
            //this hack is for microsoft edge, which sucks at window.getSelection()
            const textAreaSelection = e.target.value.substring(e.target.selectionStart, e.target.selectionEnd);
            clog("selection: " + textAreaSelection, false);
            this.props.onSelect(textAreaSelection);
        }
    }

    render() {
        clog('rendering bullet comparator', checkOptims)
        clog(this.state, checkOptims)
        clog(this.props, checkOptims)
        return (
            <div>
                <div className="bulletContainer">
                <h2>Input Bullets Here:</h2>
                <BulletEditor 
                    text={this.props.text} 
                    handleTextChange={this.props.handleTextChange} 
                    width={this.props.width}
                    onHighlight={this.handleSelect}
                    minHeight={100}/>
                </div>
                <div className="bulletContainer">
                <h2>View Output Here:</h2>
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

