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
    static MAX_UNDERFLOW = -4 //4px is around one "i"
    // optimization status codes
    static OPTIMIZED = 0;
    static FAILED_OPT = 1;
    static NOT_OPT = -1;
    // status codes for optimization direction 
    static ADD_SPACE = 1;
    static REM_SPACE = -1;

    
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
    
    // Tweak and Untweak are used to fix some miscellaneous PDF-vs-HTML formatting problems
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
    
    // This takes a sentence and width and checks to see how it fits in a span-div container.
    // width should be defined as a string in millimeters, i.e. "250.51mm"
    // I really think this function should just take in an element as an argument and not have so much
    // crap hard-coded... will refactor this next.
    static EvaluateSentence(sentence, width){
        
        // The sentence in question will be placed inside a span
        // which is inside a div which is inside another div
        var spanNode = document.createElement("span");
        spanNode.className = "bullets";

        var divNode = document.createElement("div");
        divNode.appendChild(spanNode);
        divNode.style.width = width;
        
        var borderNode = document.querySelector('#outputBorder');
        //need to actually add it to the document to see how it fits. 
        // Otherwise the width calculations below will not calculate right.
        borderNode.appendChild(divNode);

        spanNode.innerText = Bullet.Tweak(sentence)

        var divWidth = divNode.getBoundingClientRect().width;
        
        // by setting white-space to nowrap temporarily, we can see how wide the span element would be 
        // if it was restricted to be on one single line.
        spanNode.style.whiteSpace = "nowrap";

        var singleWidth = spanNode.getBoundingClientRect().width;
        //This checks to see what the single line height of the span element is.
        var singleHeight = spanNode.getBoundingClientRect().height;
        //console.log(singleHeight);

        // This makes the span node go back to normal wrapping, and we can run getBoundingClientRect() 
        //  again to see the height again
        spanNode.style.whiteSpace = "inherit";
        var spanHeight = spanNode.getBoundingClientRect().height;
        
        var overflow = (singleWidth - divWidth);
        
        var madeNewLine = spanHeight > singleHeight;
        
        divNode.remove();
        var results = {
            "optimization": {
                "status":false,
                "sentence": sentence,
                "width":width,
            },
            "direction": false
        }

        // you may be wondering, 'why do you have to check width and height? couldn't you 
        //  just check to see if overflow is greater than or less than 0? You would think so,
        //  but there are cases where the browser will fit a wider element into a smaller one,
        //  WITHOUT wrapping the line... 
        if(madeNewLine){
            results.direction = Bullet.REM_SPACE;
        }else{
            results.direction = Bullet.ADD_SPACE;
        }

        if(overflow > Bullet.MAX_UNDERFLOW && ! madeNewLine){
            results.optimization.status = Bullet.OPTIMIZED;
        }else {
            results.optimization.status = Bullet.FAILED_OPT;
        }
        return results;
                
    }
    // This function displays the bullet onto the given parent node.
    post(parent){
        
        var spanNode = document.createElement("span");
        spanNode.className = "bullets";
        
        spanNode.innerText = this.optimization.sentence || ' ';
        spanNode.innerText = Bullet.Tweak(spanNode.innerText);
        
        var warningColor = '#DC143C';
        
        if(this.optimization.status == Bullet.FAILED_OPT){
            //for cases when the optimizer tried but was not able to get a perfect solution
            spanNode.style.color = warningColor;
        }else if(this.optimization.status == Bullet.NOT_OPT){
            // for cases when the optimizer was not run, check the sentence once and color appropriately
            var results = Bullet.EvaluateSentence(this.optimization.sentence, this.optimization.width);
            if(results.optimization.status != Bullet.OPTIMIZED){ 
                spanNode.style.color = warningColor;
            }
        }

        var divNode = document.createElement("div");
        divNode.style.width = this.optimization.width;
        
        divNode.appendChild(spanNode);
        parent.appendChild(divNode);

    }
    
    optimizeSpacings(width){
  
        var smallerSpace = "\u2009";
        var largerSpace = "\u2004";
    
        var originalSentence = this.words.join(' ');

        //initialization of optimized words array
        var optWords = this.words;
        //initial instantiation of previousSentence
        var previousSentence = originalSentence;

        var initResults = Bullet.EvaluateSentence(originalSentence, width);
        
        //initial instantiation of previousResults
        var previousResults = initResults;

        var newSpace = (initResults.direction == Bullet.ADD_SPACE)? largerSpace: smallerSpace;
        
        console.log('Sentence: ' + originalSentence)
        console.log(initResults)
        //console.log('\tspan node height: ' + spanNode.offsetHeight)
        //console.log('\tdesired height: ' + singleHeight)
       
    
        function getRandomInt(seed,max){
            return Math.floor( Math.abs((Math.floor(9*seed.hashCode()+5) % 100000) / 100000) * Math.floor(max));
        }
        
        //if the sentence is blank, do nothing.
        if(! originalSentence.trim()){
            this.optimization.status = Bullet.OPTIMIZED;
            this.optimization.sentence = " ";
            this.optimization.width = width;
            //console.log('blank line');
            
        } else{

            while(true){
                //don't select the first space after the dash- that would be noticeable and look wierd.
                // also don't select the last word, don't want to add a space after that.
                var iReplace = getRandomInt(optWords.join(''), optWords.length -1 -1) + 1;
                
                //merges two elements together, joined by the space
                optWords.splice( 
                    iReplace, 2, 
                    optWords.slice(iReplace,iReplace+2).join(newSpace)
                );
        
                //make all other spaces the normal space size
                var newSentence = optWords.join(' ');
                
                // check to see how sentence fits
                var newResults = Bullet.EvaluateSentence(newSentence, width);
                //console.log(newResults)
                if(initResults.direction == Bullet.ADD_SPACE && newResults.direction == Bullet.REM_SPACE){            
                    //console.log("Note: Can't add more spaces without overflow, reverting to previous" );
                    this.optimization = previousResults.optimization;
                    break;
                } else if(initResults.direction == Bullet.REM_SPACE && newResults.direction == Bullet.ADD_SPACE){
                    //console.log("Removed enough spaces. Terminating." );
                    this.optimization = newResults.optimization;
                    break;
                } else if(optWords.length <= 2){ //this conditional needs to be last
                    console.log("\tWarning: Can't replace any more spaces");
                    this.optimization = newResults.optimization;
                    break;
                }
                previousResults = newResults;
                previousSentence = newSentence;
            } 
        } 
    }   
}