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


class BulletsList extends React.Component{
    constructor(props){
        super(props);

        const initialList = new DoublyLinkedList();

        this.props.items.map((text) => {
            const listNode = initialList.append(null, null);
            listNode.data = this.create(text, listNode);
        })
        
        this.state = { 
            focusRef : initialList.head,
            items: initialList
        };
       
    }
    create = (bulletText, listNode) => {
        return <BulletComparator 
                    onKeyDown={(e) => (this.handleKeyDown(e))} 
                    onFocus={(e) => (this.handleFocus(e,listNode))} 
                    text={bulletText} 
                    key={Math.random().toString()} 
                    ref={React.createRef()} 
                    />
    }
    
    handleKeyDown = (e) => {
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
                const listNode = state.items.append(null, focusRef);
                listNode.data = this.create('', listNode);
                return {
                    items: state.items
                };
            },
                () => {focusRef.next.data.ref.current.focus();}
            );
        }
        // still need to implement: enter on a partial line, as well as delete on beginning of line
    }
    handleFocus = (e,ref) => {       
        //this keeps track of what bullet is currently in focus
        //console.log(ref)
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
class BulletEditor extends React.Component{
    constructor(props){
        super(props);
    }
    handleChange = (e) => {
        this.props.handleTextChange(e)
    }
    render(){
        return (
            <div>
                <textarea onChange={this.handleChange} value={this.props.text}></textarea>
            </div>
        )
    }
}
//how do i get lines to line up between the output and editor?
class BulletOutputViewer extends React.Component{
    constructor(props){
        super(props)
    }
    optimize = (text) => {
        return text + "!!!!!";
    }
    render(){
        return (
            <div>
                {this.props.text.split('\n').map(
                (line,i)=>{
                    const lineOpt = this.optimize(line)
                    return <Bullet text={lineOpt} key={i+line} class='bullet optimized' />
                })}
            </div>
        )
    }

}

class BulletComparator extends Bullet {
    constructor(props){
        super(props);
        
        this.state = { 
            text: this.props.initialText,
        };
        
    }
    optimize(sentence){
        return sentence + '!';
    }
    handleTextChange = (e) => {
        this.setState({
            text: e.target.value
        })
    }
    render() {
        return (
            <div>
                <BulletEditor text={this.state.text} handleTextChange={this.handleTextChange}/>
                <BulletOutputViewer text={this.state.text} handleTextChange={this.handleTextChange} />
            </div>
        );
    }
}

const data = '- Saved Air Force moneys \n\
- Engineered 900 airplanes';

ReactDOM.render(
    <BulletComparator initialText={data} />, document.getElementById('stuff')
    );