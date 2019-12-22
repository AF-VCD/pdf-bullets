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
            <div style={{width: this.props.width}}>
                <span className={this.props.class} style={this.props.style} ref={this.props.renderRef}>
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
}

class BulletEditor extends React.Component{
    constructor(props){
        super(props);
        this.ref = React.createRef();
    }
    handleChange = (e) => {
        this.props.handleTextChange(e)
    }
    handleInput = (e) => {
        clog(this.ref,false)
        this.ref.current.style.height = 'auto';
        this.ref.current.style.height = Math.max(this.ref.current.scrollHeight, this.props.minHeight) + 'px';
    }
    render(){
        return (
            <div className="bulletContainer border" >
                <textarea 
                    ref={this.ref}
                    onChange={this.handleChange} 
                    value={this.props.text} 
                    onInput={this.handleInput}
                    style={{
                        width: this.props.width,
                    }}
                    className="bullets"></textarea>
            </div>
        )
    }
}
//how do i get lines to line up between the output and editor?
class BulletOutputViewer extends React.Component{
    constructor(props){
        super(props);
    }
    
    render(){
        return (
            <div className="bulletContainer border">
                {this.props.bullets.map(
                (line,i)=>{
                    return <OptimizedBullet text={line} 
                        width={this.props.width}
                        key={i+Bullet.tokenize(line).join(" ")} 
                        class='bullet optimized' 
                        optims={this.props.optims}
                        onOptim={this.props.onOptim}
                        optimizer={this.props.optimizer}/>
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
        }
        this.ref=React.createRef();
        this.renderRef=React.createRef();
        clog("constructed: " + this.state.text)
    }
    optimExists = (sentence) => {
        if(this.props.optims[sentence] && this.props.optims[sentence][this.props.width]){
            return true
        }else{
            return false
        }
    }
    update = () => {
        const sentence = this.state.text;
        if(this.optimExists(sentence)){
            clog('optimization already exists for ' + sentence)
            if(sentence !=  this.props.optims[sentence][this.props.width]){
                this.setState({
                    text: this.props.optims[sentence][this.props.width],
                    loading:false
                });
            }else{
                this.setState({loading:false})
            }
        }else{
            this.setState({
                loading:true
            })
            clog('Optimization loading for ' + sentence)
            this.bufferedOptimize(500);
        }
    }
   
    bufferedOptimize = (delay) => { 
        if(this.state.updating){
            clearTimeout(this.state.updating)
        }
        this.setState({
            updating: setTimeout(()=>{
                this.optimize();
                this.setState({
                    updating:null,
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
        return this.props.optimizer(this.ref.current).then((optimized) => {
            this.props.onOptim({
                "sentence":sentence,
                "width": this.props.width,
                "optimized": optimized});
            return optimized;
        }).then((sentence) => {
            this.setState({
                text:sentence,
                loading:false
            })
        }).then(()=>{clog("optimization finished")})
        
    }
  
    componentDidMount(){
        clog('component mounted for ' + this.state.text)
        clog(this.state)
        clog(this.ref)
        this.update()
    }
    componentWillUnmount(){
        clog('component unmounted ')
        clearTimeout(this.state.updating)
        
    }
    render(){
        clog('component rendered: '+ this.state.text)
        return (
            <Bullet text={this.state.text} 
                ref={this.ref}
                renderRef={this.renderRef}
                width={this.props.width} 
                class='bullet optimized' 
                style={{
                    color: this.state.loading?"gray":"inherit",
                    display:'inline-block',
                    wordBreak:'break-word',
                }}/>
        )
    }

}
class BulletComparator extends Bullet {
    constructor(props){
        super(props);
        
        this.state = { 
            text: this.props.initialText,
            optims: {}
        };

    }
    
    testOptimizer = (sentence) => {
        return new Promise((res)=>{
            let i=0;
            for(let j=0;j<10000000;j++){
                i += Math.random();
            }
            res(sentence+'!!!!'+i);
        });
    }
    optimizer = (bullet) =>{
        return new Promise((res)=>{
            //clog(bullet)
            clog(this.evaluate(bullet))
            res(bullet.props.text)
        })
    };

    evaluate = (bullet) => {
        const dispNode = bullet.props.renderRef.current;
        
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
        var overflow = (singleWidth - parentWidth);
    
        var madeNewLine = trueHeight > singleHeight;
        
        var results = {
            "optimization": {
                "status":false,
            },
            "direction": false
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
    updateOptims = (params) => {
        this.setState((state) => {
            state.optims[params.sentence] = state.optims[params.sentence] || {};
            state.optims[params.sentence][params.width] = params.optimized;
            return state
        });
    }

    handleTextChange = (e) => {
        
        this.setState({
            text: e.target.value,
        });
    }
    render() {
        //clog(this.state)
        return (
            <div>
                <BulletEditor 
                    text={this.state.text} 
                    handleTextChange={this.handleTextChange} 
                    width={this.props.width}
                    minHeight={100}/>
                <BulletOutputViewer bullets={this.state.text.split('\n')} 
                    handleTextChange={this.handleTextChange}  width={this.props.width} 
                    optims={this.state.optims} 
                    optimizer={this.optimizer}
                    onOptim={this.updateOptims}/>
            </div>
        );
    }
}

const data = '- Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys; Saved Air Force moneys;  \n\
- Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes; Engineered 900 airplanes;';

ReactDOM.render(
    <BulletComparator initialText={data} width="202.51mm"/>, document.getElementById('stuff')
    );