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
        sentence = replaceAbbrs(sentence);
        key = sentence2Key(sentence)
        if(window.bulletDict[key]){
            newBulletDict[key] = window.bulletDict[key];
        }else{
            newBulletDict[key] = {
                'optimizations':{}
            };
        }   
    }
    //return bulletDict;
    window.bulletDict = newBulletDict;
}

class Bullet{
    static MAX_UNDERFLOW = -4 //4px is around one i
    static OPTIMIZED = 0;
    static ADD_SPACE = 1;
    static REM_SPACE = -1;
    static FAILED_OPT = 1;
    static NOT_OPT = -1;
    
    constructor(bullet){
        var bullet = bullet.trim();
        if(! bullet){bullet = " ";}
        this.words = tokenize(bullet);
        this.optimization = {
            "status": Bullet.NOT_OPT,
            "sentence": this.words.join(" "),
            "width": "0mm",
        }
    }
    static Tweak(sentence){
        
        sentence =  sentence.replace(/(\w)\//g,'$1/\u200B');
        sentence =  sentence.replace(/-/g,'\u2011');
        return sentence;
    }
    static Untweak(sentence){
        sentence =  sentence.replace(/[\u200B]/g,'');
        sentence =  sentence.replace(/[\u2011]/g,'-');
        return sentence;
    }
    post(parent){
        //console.log(this.optimization)
        var spanNode = document.createElement("span");
        spanNode.className = "bullets";
        //spanNode.style.width = this.optimization.width;
        spanNode.innerText = this.optimization.sentence? this.optimization.sentence: ' ';
        spanNode.innerText = Bullet.Tweak(spanNode.innerText);
        
        var badColor = '#DC143C';
        if(this.optimization.status == Bullet.FAILED_OPT){
            spanNode.style.color = badColor;
        }else if(this.optimization.status == Bullet.NOT_OPT){
            
            var status = Bullet.EvaluateSentence(this.optimization.sentence, this.optimization.width);
            if(status.optimization != Bullet.OPTIMIZED){ 
                spanNode.style.color = badColor;
            }
        }else{
            spanNode.style.color = 'black';
        }

        var divNode = document.createElement("div");
        divNode.style.width = this.optimization.width;
        //divNode.style.wordWrap = 'break-word'
        divNode.appendChild(spanNode);
        parent.appendChild(divNode);

    }
    static EvaluateSentence(sentence, width){
        var spanNode = document.createElement("span");
        spanNode.className = "bullets";
        //spanNode.style.width = width;

        var divNode = document.createElement("div");
        divNode.appendChild(spanNode);
        divNode.style.width = width;
        
        var borderNode = document.querySelector('#outputBorder');
        //need to actually add it to the document to see how it fits
        borderNode.appendChild(divNode);

        spanNode.innerText = sentence;
        
        spanNode.innerText = Bullet.Tweak(spanNode.innerText)

        var divWidth = divNode.getBoundingClientRect().width;
        //This checks to see what the single line height of the span element is.
        spanNode.style.whiteSpace = "nowrap";
        var singleWidth = spanNode.getBoundingClientRect().width;
        var singleHeight = spanNode.getBoundingClientRect().height;
        //console.log(singleHeight);
        spanNode.style.whiteSpace = "inherit";

        
        var overflow = (singleWidth - divWidth);
        //console.log(spanNode.getBoundingClientRect().height)
        var madeNewLine = spanNode.getBoundingClientRect().height > singleHeight;
        
        divNode.remove();
        var statuses = {
            "optimization": false,
            "direction": false
        }
        if(madeNewLine){
            statuses.direction = Bullet.REM_SPACE;
        }else{
            statuses.direction = Bullet.ADD_SPACE;
        }

        if(overflow > Bullet.MAX_UNDERFLOW && ! madeNewLine){
            statuses.optimization = Bullet.OPTIMIZED;
        }else {
            statuses.optimization = Bullet.FAILED_OPT;
        }
        return statuses;
               
    }
    optimizeSpacings(width){
  
        var smallerSpace = "\u2009";
        var largerSpace = "\u2004";
    
        var originalSentence = this.words.join(' ');

        //initialization of optimized words array
        var optWords = this.words;
        //initial instantiation of previousSentence
        var previousSentence = originalSentence;

        var initStatus = Bullet.EvaluateSentence(originalSentence, width);

        var newSpace = (initStatus.direction == Bullet.ADD_SPACE)? largerSpace: smallerSpace;
        
        console.log('Sentence: ' + originalSentence)
        //console.log(initStatus)
        //console.log('\tspan node height: ' + spanNode.offsetHeight)
        //console.log('\tdesired height: ' + singleHeight)
       
    
        function getRandomInt(seed,max){
            return Math.floor( Math.abs((Math.floor(9*seed.hashCode()+5) % 100000) / 100000) * Math.floor(max));
        }
        var finalSentence;
        while(true){
            //if the sentence is blank, do nothing.
            if(! originalSentence.trim()){
                this.optimization.status = Bullet.OPTIMIZED;
                //console.log('blank line');
                finalSentence = ' ';
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
    
            //make all other spaces the normal space size
            var newSentence = optWords.join(' ');
    
            var newStatus = Bullet.EvaluateSentence(newSentence, width);
            //console.log(newStatus)
            if(optWords.length <= 2){
                //console.log("\tWarning: Can't replace any more spaces");
                this.optimization.status = newStatus.optimization;
                finalSentence = newSentence;
                break;
            }else if(initStatus.direction == Bullet.ADD_SPACE && newStatus.direction == Bullet.REM_SPACE){            
                //console.log("Note: Can't add more spaces without overflow, reverting to previous" );
                finalSentence = previousSentence;
                this.optimization.status = Bullet.OPTIMIZED;
                break;
            } else if(initStatus.direction == Bullet.REM_SPACE && newStatus.direction == Bullet.ADD_SPACE){
                //console.log("Removed enough spaces. Terminating." );
                finalSentence = newSentence;
                this.optimization.status = Bullet.OPTIMIZED;
                break;
            }
         
            previousSentence = newSentence;
        }
        //at this point, spacings should be optimized as best as possible.
        this.optimization.sentence = finalSentence;
        this.optimization.width = width;
        
    }   
}