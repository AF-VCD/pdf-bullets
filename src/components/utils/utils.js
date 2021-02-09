import {tokenize} from './Tools'
import {STATUS} from '../../const/const'

export const hashCode = (str) => {
    let hash = 0, i, chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };

export const getRandomInt =(seed, max) => {
    return Math.floor(Math.abs((Math.floor(9 * hashCode(seed) + 5) % 100000) / 100000) * Math.floor(max));
}

export const optimize = (sentence, evalFcn) => {

    const smallerSpace = "\u2006";
    const largerSpace = "\u2004";

    //initialization of optimized words array
    let optWords = tokenize(sentence.trimEnd());

    const initResults = evalFcn(sentence);

    // good
    if (initResults.overflow === 0) {
        return initResults;
    }

    //initial instantiation of previousResults
    let prevResults = initResults;
    let finalResults = initResults;
    const newSpace = (initResults.overflow >= 0) ? smallerSpace : largerSpace;

    let finalOptimStatus = STATUS.NOT_OPT;

    // like in the while loop, want to not replace the first space after the dash.
    const worstCaseResults = evalFcn(optWords[0] + ' ' + optWords.slice(1).join(newSpace));

    if( (newSpace === smallerSpace && worstCaseResults.overflow > 0) || 
            (newSpace === largerSpace && worstCaseResults.overflow < STATUS.MAX_UNDERFLOW) ){
            // this means that there is no point in trying to optimize.
            
            return {
                status: STATUS.FAILED_OPT,
                rendering: worstCaseResults,
            };
    }

    while (initResults.overflow > 0 || initResults.overflow < STATUS.MAX_UNDERFLOW) {
        //don't select the first space after the dash- that would be noticeable and look wierd.
        // also don't select the last word, don't want to add a space after that.
        let indexToReplace = getRandomInt(optWords.join(''), optWords.length - 1 - 1) + 1;

        //merges two elements together, joined by the space
        optWords.splice(
            indexToReplace, 2,
            optWords.slice(indexToReplace, indexToReplace + 2).join(newSpace)
        );

        //make all other spaces the normal space size
        let newSentence = optWords.join(' ');

        console.log(newSentence.split(' '))
        let newResults = evalFcn(newSentence);

        if (initResults.overflow <= 0 && newResults.overflow > 0) {
            console.log("Note: Can't add more spaces without overflow, reverting to previous" );
            finalResults = prevResults;
            finalOptimStatus = STATUS.OPTIMIZED;
            break;
        } else if (initResults.overflow > 0 && newResults.overflow < 0) {
            console.log("Removed enough spaces. Terminating." );
            finalResults = newResults;
            finalOptimStatus = STATUS.OPTIMIZED;
            break;
        }
        
        prevResults = newResults;
    }
    return {
        status: finalOptimStatus,
        rendering: finalResults,
    };
}