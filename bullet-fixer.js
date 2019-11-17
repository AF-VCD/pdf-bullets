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


function sentence2Key(sentence){
    return tokenize(sentence).join(' ').trim().hashCode().toString();
}
function updateDict(textAreaId){
    newBulletDict = {}
    for (sentence of (document.getElementById(textAreaId)).value.split('\n')){
        key = sentence2Key(sentence)
        if(window.bulletDict[key]){
            newBulletDict[key] = window.bulletDict[key];
        }else{
            newBulletDict[key] = {
                'optimization':{}
            };
        }   
    }
    //return bulletDict;
    window.bulletDict = newBulletDict;
}

class Bullet{
    constructor(bullet){
        var bullet = bullet.trim();
        if(! bullet){bullet = " ";}
        this.words = tokenize(bullet);
        this.optimization = {
            "status": -1,
            "sentence": this.words.join(""),
            "width": "0 mm",
        }
    }
    post(parent){
        
        var spanNode = document.createElement("span");
        spanNode.className = "bullets";
        spanNode.style.width = this.optimization.width;
        spanNode.innerText = this.optimization.sentence;

        if(this.optimization.status == 1){
            spanNode.style.color = '#DC143C';
        }else{
            spanNode.style.color = 'black';
        }

        var divNode = document.createElement("div");
        divNode.style.width = this.optimization.width;
        
        divNode.appendChild(spanNode);
        parent.appendChild(divNode);

    }
    optimizeSpacings(width){
        
        var spanNode = document.createElement("span");
        spanNode.className = "bullets";
        spanNode.style.width = width;

        var divNode = document.createElement("div");
        divNode.appendChild(spanNode);
        divNode.style.width = width;
        //need to actually add it to the document to see how it fits
        document.body.appendChild(divNode);

        var smallerSpace = "\u2009";
        var largerSpace = "\u2004";
    
        var originalSentence = this.words.join(' ');
        spanNode.innerText = originalSentence;

        //initialization of optimized words array
        var optWords = this.words;
        //initial instantiation of previousSentence
        var previousSentence = originalSentence;
        
        //This checks to see what the single line height of the span element is.
        spanNode.style.whiteSpace = "nowrap";
        var singleHeight = spanNode.offsetHeight;
        spanNode.style.whiteSpace = "inherit";
    
        var addSpace = (spanNode.offsetHeight <= singleHeight);
        
        var newSpace = addSpace? largerSpace: smallerSpace;
        
        console.log('Sentence: ' + originalSentence)
        //console.log('\tspan node height: ' + spanNode.offsetHeight)
        //console.log('\tdesired height: ' + singleHeight)
        //console.log('\taddSpace: ' + addSpace)
    
        function getRandomInt(seed,max){
            return Math.floor( Math.abs((Math.floor(9*seed.hashCode()+5) % 100000) / 100000) * Math.floor(max));
        }

        while(true){
            //if the sentence is blank, do nothing.
            if(!originalSentence.trim()){
                this.optimization.status = 0;
                break;
            }
           if(optWords.length <= 2){
                console.log("\tWarning: Can't replace any more spaces");
                this.optimization.status = 1;
                break;
            }

            //don't select the first space after the dash- that would be noticeable and look wierd.
            // also don't select the last word, don't want to add a space after that.
            var iReplace = getRandomInt(optWords.join(''), optWords.length -1 -1) + 1;
            
            //merges two elements together, joined by 
            optWords.splice( 
                iReplace, 2, 
                optWords.slice(iReplace,iReplace+2).join(newSpace)
            );
            //console.log( (addSpace?'increased':'decreased') + ' space at index ' + iReplace + " : " + optWords[iReplace]);
    
            //make all other spaces the normal space size
            var newSentence = optWords.join(' ');
    
            //insert into the spanNode and see how its shape changes
            spanNode.innerText = newSentence;
            var overflow = (spanNode.offsetHeight>singleHeight);
    
            if(addSpace && overflow){            
                //console.log("Warning: Can't add more spaces without overflow, reverting to previous" );
                spanNode.innerText = previousSentence;
                this.optimization.status = 0;
                break;
            
            } else if(!addSpace && !overflow){
                //console.log("Removed enough spaces. Terminating." );     
                this.optimization.status = 0;
                break;
            }
         
            previousSentence = newSentence;
        }
        //at this point, spacings should be optimized as best as possible.
        this.optimization.sentence = spanNode.innerText;
        this.optimization.width = width;
        divNode.remove();
    }   
}