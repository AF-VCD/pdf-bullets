class Bullet extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div style={{width: this.props.width}}>
                <span className={this.props.class} style={this.props.style}>
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
    }
}

class BulletEditor extends React.Component{
    constructor(props){
        super(props);
    }
    handleChange = (e) => {
        this.props.handleTextChange(e)
    }
    render(){
        return (
            <div className="bulletContainer border" >
                <textarea 
                    onChange={this.handleChange} 
                    value={this.props.text} 
                    style={{width: this.props.width}}
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
class OptimizedBullet extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            text: this.props.text,
            loading: true
        }
        console.log("reconstructed " + this.props.text)
    }
    alreadyOptim = (sentence) => {
        if(this.props.optims[sentence] && this.props.optims[sentence][this.props.width]){
            return true
        }else{
            return false
        }
    }
    update = (sentence) => {
        if(this.alreadyOptim(sentence)){
            if(this.state.text !=  this.props.optims[sentence][this.props.width]){
                this.setState({
                    text: this.props.optims[sentence][this.props.width],
                    loading:false
                });
            }else{
                this.setState({loading:false})
            }
        }else{
            console.log('Optimization not found (yet)')
            this.setState({
                text: this.props.text,
                loading:true
            })
            this.optimize(sentence);
        }
    }
    optimize = (sentence) => {
        sentence = Bullet.clean(sentence);
        return this.props.optimizer(sentence).then((optimized) => {
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
        })
        
    }
  
    componentDidMount(){
        console.log('component mounted: ' + this.props.text)
        const slowUpdate = debounced(500, this.update)
        slowUpdate(this.props.text)
        //this.update(this.props.text);
    }
    
    render(){
        //console.log(this.props)
        return (
            <Bullet text={this.state.text} 
                        width={this.props.width} 
                        class='bullet optimized' style={this.state.loading ? {color:"gray"}: {}}/>
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

        this.state.text.split('\n').map((line) => {
            this.state.optims[line] = this.state.optims[line] || {};
            this.optimize(line).then((optimized)=>{
                this.state.optims[line][this.props.width]=optimized
            });
        })

    }

    optimize = (sentence) => {
        return new Promise((res)=>{
            let i=0;
            for(let j=0;j<100000;j++){
                i += Math.random();
            }
            res(sentence+'!!!!'+i);
        });
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
        //console.log(this.state)
        return (
            <div>
                <BulletEditor text={this.state.text} handleTextChange={this.handleTextChange} width={this.props.width}/>
                <BulletOutputViewer bullets={this.state.text.split('\n')} 
                    handleTextChange={this.handleTextChange}  width={this.props.width} 
                    optims={this.state.optims} 
                    optimizer={this.optimize}
                    onOptim={this.updateOptims}/>
            </div>
        );
    }
}

const data = '- Saved Air Force moneys \n\
- Engineered 900 airplanes';

ReactDOM.render(
    <BulletComparator initialText={data} width="202.51mm"/>, document.getElementById('stuff')
    );