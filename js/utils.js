class DoublyLinkedList {
    constructor() {
       this.head = null;
       this.tail = null;
       this.length = 0;
    }
    append(data, position) {
       let node = new this.Node(data);
       // List is currently empty
       this.length++;
       if (this.head === null) {
          this.head = node;
          this.tail = node;
          return this.head;
       }
       if(position === null){
           position = this.tail;
       }
       if(position == this.tail){
           position.next = node;
           node.prev = position;
           node.next = null;
           this.tail = node;
       }else {
            node.prev = position;
            node.next = position.next;
            node.next.prev = node;
            position.next = node;
       }
       return node;
    }
    remove(position = this.tail) {
       if (this.length === 0) {
          console.log("List is already empty");
          return;
       }
       this.length--;
       if (position == this.head) {
          this.head = this.head.next;
          this.head.prev = null;
       } else if (position == this.tail) {
          this.tail = this.tail.prev;
          this.tail.next = null;
       } else {
          position.prev.next = position.next;
          position.next.prev = position.prev;
       }
       return position;
    }
    * get() {
       let currNode = this.head;
       while (currNode != null) {
          //console.log(currNode.data + " <-> ");
          yield currNode.data;
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


 debounced= (delay, fn) => {
   let timerId;
   return function (...args) {
       if (timerId) {
       clearTimeout(timerId);
       }
       timerId = setTimeout(() => {
       fn(...args);
       timerId = null;
       }, delay);
   }
}

clog = (message, bool) => {
   if(typeof bool == 'undefined' || bool){
      console.log(message)
   }
}

String.prototype.hashCode = function() {
   let hash = 0, i, chr;
   if (this.length === 0) return hash;
   for (i = 0; i < this.length; i++) {
     chr   = this.charCodeAt(i);
     hash  = ((hash << 5) - hash) + chr;
     hash |= 0; // Convert to 32bit integer
   }
   return hash;
 };

 // booleans for debugging
const checkOptims = false;
const checkAbbrs = false;
const checkPDF = false;
const checkSave = false;
const checkEditor = false;
const checkJSON = false;
const checkThesaurus = false;