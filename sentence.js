class Bullet extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div className={this.props.class}>
                {this.props.text}
            </div>
        );
    }
}
class BulletEditable extends Bullet{
    constructor(props){
        super(props);
        this.handleChange = props.onChange;
        this.handleKeyDown = props.onKeyDown;
        this.handleFocus = props.onFocus;
    }
    render(){
        return(
            <div className={this.props.class}>
                <input type="text" value={this.props.text} onChange={this.handleChange} onKeyDown={this.handleKeyDown} onFocus={this.handleFocus}/>
            </div>
        );
    }
}
class BulletComparator extends Bullet {
    constructor(props){
        super(props);
       
        this.handleKeyDown = props.onKeyDown.bind(this);
        this.handleFocus = props.onFocus.bind(this)
        this.state = { 
            text: this.props.text,
            optimText: this.optimize(this.props.text)
        };
    }
    optimize(sentence){
        return sentence + '!';
    }

    bulletEdited(e) {
        this.setState({ 
            text: e.target.value,
            optimText: this.optimize(e.target.value)
        });
    }
    render() {
        return (
            <div>
                <BulletEditable text={this.state.text} onChange={this.bulletEdited} onKeyDown={this.handleKeyDown} onFocus={this.handleFocus} class='bullet editable' />
                <Bullet text={this.state.optimText} class='bullet optimized' />
            </div>
        );
    }
}
class BulletsList extends React.Component{
    constructor(props){
        super(props)
        this.focusedEl = React.createRef();
        this.focusRefs  = props.items.map(
            (item,i)=>(React.createRef())
        );
        
        this.state = { 
            iFocus: 0,
            BulletComparators: props.items.map(
                (item, i) => (
                <BulletComparator onKeyDown={(e) => (this.handleKeyDown(e))} 
                    onFocus={(e) => (this.handleFocus(e,i))} text={item} key={i} ref={this.focusRefs[i]}/>
                )
            )
        };
    }
    handleKeyDown(e){
        
        //38 is UP
        if(e.keyCode == 38) {
            //console.log('UP')
            if(this.state.iFocus > 0){
                console.log(this.state.BulletComparators[this.state.iFocus-1])
            }
        }else if(e.keyCode == 40){
            console.log('DOWN')
        } //need to handle enter key as well
    }
    handleFocus(e,i){
        console.log(i)
        //console.log(e)
        this.setState({ 
            iFocus: i
        });
    }
    render(){
        return (
            <div>
                {this.state.BulletComparators}
            </div>
        )
    }
}


const data = ['- Saved Air Force moneys', '- Engineered 900 airplanes'];
ReactDOM.render(
    <BulletsList items={data} />, document.getElementById('stuff')
    );