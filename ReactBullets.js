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
        this.inputRef = React.createRef();
    }
    focus(){
        this.inputRef.current.focus();
    }
    render(){
        return(
            <div className={this.props.class}>
                <input type="text" 
                    ref={this.inputRef}
                    value={this.props.text} 
                    onChange={this.handleChange} 
                    onKeyDown={this.handleKeyDown} 
                    onFocus={this.handleFocus}/>
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
        this.inputElRef = React.createRef();
    }
    optimize(sentence){
        return sentence + '!';
    }
    focus(){
        this.inputElRef.current.focus()
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
                <BulletEditable text={this.state.text} 
                    onChange={this.bulletEdited} 
                    onKeyDown={this.handleKeyDown} 
                    onFocus={this.handleFocus} class='bullet editable' 
                    ref={this.inputElRef} />
                <Bullet text={this.state.optimText} class='bullet optimized' />
            </div>
        );
    }
}
class BulletsList extends React.Component{
    constructor(props){
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleFocus = this.handleFocus.bind(this)
        this.create = this.create.bind(this)
        const initialList = new DoublyLinkedList();

        this.props.items.map((text)=>{
            const listRef = initialList.append(null, null);
            listRef.data = this.create(text, listRef);
        })
        
        this.state = { 
            focusRef : initialList.head,
            items: initialList
        };
       
    }
    create(bulletText, listRef){
        return <BulletComparator 
                    onKeyDown={(e) => (this.handleKeyDown(e))} 
                    onFocus={(e) => (this.handleFocus(e,listRef))} 
                    text={bulletText} 
                    key={Math.random().toString()} 
                    ref={React.createRef()} 
                    />
    }
    
    handleKeyDown(e){
        //console.log(this.state.BulletComparators);
        const focusRef = this.state.focusRef;
        console.log(focusRef)
        if(e.keyCode == 38) {
            //38 is UP
            if(focusRef.prev != null){
                //this.focusRefs[i-1].current.focus();
                focusRef.prev.data.ref.current.focus();
            }
        }else if(e.keyCode == 40){
            //40 is DOWN
            if(focusRef.next != null){
                focusRef.next.data.ref.current.focus();
            }
        } else if(e.keyCode == 13) {
            this.setState((state)=>{
                const listRef = state.items.append(null, focusRef);
                listRef.data = this.create('', listRef);
                return {
                    items: state.items
                };
            },
                () => {focusRef.next.data.ref.current.focus();}
            );
        }
        // still need to implement: enter on a partial line, as well as delete on beginning of line
    }
    handleFocus(e,ref){       
        //this keeps track of what bullet is currently in focus
        console.log(ref)
        this.setState({ 
            focusRef: ref
        });
    }
    render(){
        return (
            <div>
                {Array.from(this.state.items.get())}
            </div>
        )
    }
}

const data = ['- Saved Air Force moneys', '- Engineered 900 airplanes'];
ReactDOM.render(
    <BulletsList items={data} />, document.getElementById('stuff')
    );