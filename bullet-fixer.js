String.prototype.hashCode = function() {
    var hash = 0, i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };
  
function getRandomInt(seed,max){
    return Math.floor( Math.abs((Math.floor(9*seed.hashCode()+5) % 100000) / 100000) * Math.floor(max));
}
function tokenize(sentence){
    words = sentence.split(/[\s]+/);
    //console.log(words);
    return words;
}
function normalizeWhiteSpace(textAreaId){
    cleaned = '';
        for (sentence of (document.getElementById(textAreaId)).value.split('\n')){
            cleaned += tokenize(sentence).join(' ') + '\n';
        }
        console.log("reformatted all white spaces")
        document.getElementById(textAreaId).value = cleaned;
}
function optimizeSpacings(spanNode){

    var words = tokenize(spanNode.innerText);
    
    var smallerSpace = "\u2009";
    var largerSpace = "\u2004";

    var originalSentence = words.join(' '); 
    spanNode.innerText = originalSentence;
  
    if(!originalSentence.trim()){return;}

    //initial instantiation of previousSentence
    var previousSentence = originalSentence;
    
    //This checks to see what the single line height of the span element is.
    spanNode.style.whiteSpace = "nowrap"
    singleHeight = spanNode.offsetHeight;
    spanNode.style.whiteSpace = "inherit"

    var addSpace = (spanNode.offsetHeight <= singleHeight);
    
    newSpace = addSpace? largerSpace: smallerSpace;
    
    console.log('Sentence: ' + originalSentence)
    //console.log('\tspan node height: ' + spanNode.offsetHeight)
    //console.log('\tdesired height: ' + singleHeight)
    console.log('\taddSpace: ' + addSpace)

    while(true){

       if(words.length <= 2){
            console.log("\tWarning: Can't replace any more spaces");
            spanNode.style.color = '#DC143C';
            break;
        }
        
        //don't select the first space after the dash- that would be noticeable and look wierd.
        // also don't select the last word, don't want to add a space after that.
        iReplace = getRandomInt(words.join(''), words.length -1 -1) + 1;
        
        //merges two elements together, joined by 
        words.splice( 
            iReplace, 2, 
            words.slice(iReplace,iReplace+2).join(newSpace)
        );
        //console.log( (addSpace?'increased':'decreased') + ' space at index ' + iReplace + " : " + words[iReplace]);

        //make all other spaces the normal space size
        newSentence = words.join(' ');

        //insert into the spanNode and see how its shape changes
        spanNode.innerText = newSentence;
        overflow = (spanNode.offsetHeight>singleHeight);

        if(addSpace && overflow){            
            //console.log("Warning: Can't add more spaces without overflow, reverting to previous" );
            spanNode.innerText = previousSentence;
            break;
        
        } else if(!addSpace && !overflow){
            //console.log("Removed enough spaces. Terminating." );     
            break;
        }
     
        previousSentence = newSentence;
    }
}