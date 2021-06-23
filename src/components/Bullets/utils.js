import { STATUS } from "../../const/const";

/* 
str: string
return: number
*/
export const hashCode = (str) => {
  let hash = 0,
    i,
    chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

    // Regex- split after one of the following: \u2004 \u2009 \u2006 \s ? / | - % !
    // but ONLY if immediately followed by: [a-zA-z] [0-9] + \
export const AdobeLineSplitFn = (text)=>{
  const regex = /([\u2004\u2009\u2006\s?/|\-%!])(?=[a-zA-Z0-9+\\])/
  return text.split(regex).filter(Boolean);
}

/*
seed: string
max: number
return: number
*/
export const getRandomInt = (seed, max) => {
  return Math.floor(
    Math.abs((Math.floor(9 * hashCode(seed) + 5) % 100000) / 100000) *
      Math.floor(max)
  );
};

export const tokenize = (sentence) => {
  return sentence.split(/[\s]+/);
};

/*
sentence: string
evalFcn: string to 
        results: {
            textLines: string,
            fullWidth: number,
            lines: number,
            overflow: number,
        };
return: {
    status: STATUS
    rendering: results
}
*/
export const optimize = (sentence, evalFcn) => {
  const smallerSpace = "\u2006";
  const largerSpace = "\u2004";

  //initialization of optimized words array
  let optWords = tokenize(sentence.trimEnd());

  const initResults = evalFcn(sentence);

  // Sentence is fine, don't need to optimize
  if (initResults.overflow === 0) {
    return {
      status: STATUS.OPTIMIZED,
      rendering: initResults,
    };
  }

  //initial instantiation of previousResults
  let prevResults = initResults;
  let finalResults = initResults;
  const newSpace = initResults.overflow >= 0 ? smallerSpace : largerSpace;

  let finalOptimStatus = STATUS.NOT_OPT;

  // like in the while loop, want to not replace the first space after the dash.
  const worstCaseResults = evalFcn(
    optWords[0] + " " + optWords.slice(1).join(newSpace)
  );

  if (
    (newSpace === smallerSpace && worstCaseResults.overflow > 0) ||
    (newSpace === largerSpace &&
      worstCaseResults.overflow < STATUS.MAX_UNDERFLOW)
  ) {
    // this means that there is no point in trying to optimize.

    return {
      status: STATUS.FAILED_OPT,
      rendering: worstCaseResults,
    };
  }

  while (true) {
    //don't select the first space after the dash- that would be noticeable and look wierd.
    // also don't select the last word, don't want to add a space after that.
    let indexToReplace =
      getRandomInt(optWords.join(""), optWords.length - 1 - 1) + 1;

    //merges two elements together, joined by the space
    optWords.splice(
      indexToReplace,
      2,
      optWords.slice(indexToReplace, indexToReplace + 2).join(newSpace)
    );

    //make all other spaces the normal space size
    let newSentence = optWords.join(" ");

    //console.log(newSentence.split(' '))
    let newResults = evalFcn(newSentence);

    if (newSpace === largerSpace && newResults.overflow > 0) {
      //console.log("Note: Can't add more spaces without overflow, reverting to previous" );
      finalResults = prevResults;
      finalOptimStatus = STATUS.OPTIMIZED;
      break;
    } else if (newSpace === smallerSpace && newResults.overflow <= 0) {
      //console.log("Removed enough spaces. Terminating." );
      finalResults = newResults;
      finalOptimStatus = STATUS.OPTIMIZED;
      break;
    } else if (optWords.length <= 2) {
      // no more optimization could be done.
      finalResults = newResults;
      if (
        newSpace === largerSpace &&
        finalResults.overflow > STATUS.MAX_UNDERFLOW
      ) {
        finalOptimStatus = STATUS.OPTIMIZED;
      } else {
        finalOptimStatus = STATUS.FAILED_OPT;
      }
      break;
    }

    prevResults = newResults;
  }

  /*   console.log({
    sentence,
    optWords,
    initResults,
    finalResults,
    worstCaseResults,
    finalOptimStatus,
  }); */

  return {
    status: finalOptimStatus,
    rendering: finalResults,
  };
};

/*
text: string
getWidth: function: string to number
width: string
return: results: {
            textLines: string,
            fullWidth: number,
            lines: number,
            overflow: number,
        };
*/
// all widths in this function are in pixels
export const renderBulletText = (text, getWidth, width) => {
  // this function expects a single line of text with no line breaks.
  if (text.match("\n")) {
    console.error("renderBulletText expects a single line of text");
  }

  const fullWidth = getWidth(text.trimEnd());
  if (text === "") {
    return {
      textLines: [],
      fullWidth: 0,
      lines: 0,
      overflow: 0 - width,
    };
  }
  if (fullWidth < width) {
    return {
      textLines: [text],
      fullWidth: fullWidth,
      lines: 1,
      overflow: fullWidth - width,
    };
  } else {
    // Scenario where the width of the text is wider than desired.
    //  In this case, work needs to be done to figure out where the line breaks should be.

    // Regex- split after one of the following: \u2004 \u2009 \u2006 \s ? / | - % !
    // but ONLY if immediately followed by: [a-zA-z] [0-9] + \
    const textSplit = AdobeLineSplitFn(text); 

    // check to make sure the first token is smaller than the desired width.
    //   This is usually true, unless the desired width is abnormally small, or the
    //   input text is one really long word
    if (getWidth(textSplit[0].trimEnd()) < width) {
      let answerIdx = 0;
      for (let i = 1; i <= textSplit.length; i++) {
        const evalText = textSplit.slice(0, i).join("").trimEnd();
        const evalWidth = getWidth(evalText);
        if (evalWidth > width) {
          answerIdx = i - 1;
          break;
        }
      }
      const recursedText = textSplit
        .slice(answerIdx, textSplit.length)
        .join("");

      if (recursedText === text) {
        console.warn("Can't fit \"" + text + '" on a single line\n', {
          text,
          width,
          fullWidth,
        });
        return {
          textLines: [text],
          fullWidth,
          lines: 1,
          overflow: fullWidth - width,
        };
      } else {
        const recursedResult = renderBulletText(recursedText, getWidth, width);

        return {
          textLines: [
            textSplit.slice(0, answerIdx).join(""),
            ...recursedResult.textLines,
          ],
          fullWidth: fullWidth,
          lines: 1 + recursedResult.lines,
          overflow: fullWidth - width,
        };
      }
    } else {
      // if the first token is wider than the desired width, a line break will need to be inserted somewhere in the token.
      // Using binary search (I think) to find the correct spot for the line break.
      const avgCharWidth = fullWidth / text.length;
      const guessIndex = parseInt(width / avgCharWidth);
      const firstGuessWidth = getWidth(text.substring(0, guessIndex));
      let answerIdx = guessIndex;
      if (firstGuessWidth > width) {
        for (let i = guessIndex - 1; i > 0; i--) {
          const nextGuessWidth = getWidth(text.substring(0, i));
          if (nextGuessWidth < width) {
            answerIdx = i;
            break;
          }
        }
      } else if (firstGuessWidth < width) {
        for (let i = guessIndex; i <= text.length; i++) {
          const nextGuessWidth = getWidth(text.substring(0, i));
          if (nextGuessWidth > width) {
            answerIdx = i - 1;
            break;
          }
        }
      }
      const recursedText = text.substring(answerIdx, text.length);
      if (recursedText === text) {
        console.warn("Can't fit \"" + text + '" on a single line\n', {
          text,
          width,
          fullWidth,
        });
        return {
          textLines: [text],
          fullWidth,
          lines: 1,
          overflow: fullWidth - width,
        };
      } else {
        const recursedResult = renderBulletText(recursedText, getWidth, width);

        return {
          textLines: [
            text.substring(0, answerIdx),
            ...recursedResult.textLines,
          ],
          fullWidth: fullWidth,
          lines: 1 + recursedResult.lines,
          overflow: fullWidth - width,
        };
      }
    }
  }
};
