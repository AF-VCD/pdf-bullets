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
        this.insert = this.insert.bind(this)
        this.state = { 
            iFocus: 0,
            BulletComparators: props.items.map(this.insert)
        };
    }
    insert(bulletText, i){
        return <BulletComparator 
                    onKeyDown={(e) => (this.handleKeyDown(e))} 
                    onFocus={(e) => (this.handleFocus(e,i))} 
                    text={bulletText} 
                    key={Math.random().toString()} 
                    ref={React.createRef()} 
                    />
    }
    handleKeyDown(e){
        //console.log(this.state.BulletComparators);
        if(e.keyCode == 38) {
            //38 is UP
            const i = this.state.iFocus;
            if(i > 0){
                //this.focusRefs[i-1].current.focus();
                this.state.BulletComparators[i-1].ref.current.focus();
            }
        }else if(e.keyCode == 40){
            //40 is DOWN
            const i = this.state.iFocus;
            if(i+1 < this.state.BulletComparators.length){
                this.state.BulletComparators[i+1].ref.current.focus();
            }
        } else if(e.keyCode == 13) {
            const i = this.state.iFocus;
            this.setState((state)=>{
                const newBulletComparators = [...state.BulletComparators];
                newBulletComparators.splice(i+1, 0, this.insert('',i));
                return {
                    BulletComparators: newBulletComparators
                };
            },
                () => {this.state.BulletComparators[i+1].ref.current.focus();}
            );

        }
    }
    handleFocus(e,i){       
        //this keeps track of what bullet is currently in focus
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

class DoublyLinkedList {
    constructor() {
       this.head = null;
       this.tail = null;
       this.length = 0;
    }
    insert(data, position = this.length) {
       let node = new this.Node(data);
       // List is currently empty
       if (this.head === null) {
          this.head = node;
          this.tail = node;
          this.length++;
          return this.head;
       }
       // Insertion at head
       if (position == 0) {
          node.prev = null;
          node.next = this.head;
          this.head.prev = node;
          this.head = node;
          return this.head;
       }
       let iter = 1;
       let currNode = this.head;
       while (currNode.next != null && iter < position) {
          currNode = currNode.next; iter++;
       }
       // Make new node point to next node in list
       node.next = currNode.next;
       // Make next node's previous point to newnode 
       if (currNode.next != null) {
          currNode.next.prev = node;
       }
       // Make our node point to previous node
       node.prev = currNode;
 
       // Make previous node's next point to new node
       currNode.next = node;
 
       // check if inserted element was at the tail, if yes then make tail point to it 
       if (this.tail.next != null) {
          this.tail = this.tail.next;
       }
       this.length++;
       return node;
    }
    remove(data, position = 0) {
       if (this.length === 0) {
          console.log("List is already empty");
          return;
       }
       this.length--;
       let currNode = this.head;
       if (position <= 0) {
          this.head = this.head.next;
          this.head.prev = null;
       } else if (position >= this.length - 1) {
          this.tail = this.tail.prev;
          this.tail.next = null;
       } else {
          let iter = 0;
          while (iter < position) {
             currNode = currNode.next;
             iter++;
          }
          currNode.next = currNode.next.next;
          currNode.next.prev = currNode;
       }
       return currNode;
    }
    display() {
       let currNode = this.head;
       while (currNode != null) {
          console.log(currNode.data + " <-> ");
          currNode = currNode.next;
       }
    }
 }
 
 DoublyLinkedList.prototype.Node = class {
    constructor(data) {
       this.data = data;
       this.next = null;
       this.prev = null;
    }
 };

const data = ['- Saved Air Force moneys', '- Engineered 900 airplanes'];
ReactDOM.render(
    <BulletsList items={data} />, document.getElementById('stuff')
    );