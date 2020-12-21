import React from "react"
import { renderBulletText, tokenize } from './Tools.js'

// optimization status codes
// status codes for optimization direction 
const STATUS = {
    OPTIMIZED: 0,
    FAILED_OPT: 1,
    NOT_OPT: -1,
}

const MAX_UNDERFLOW = -4;

function Bullet({ text="", widthPx=500, enableOptim=false, height, onHighlight }) {
    const canvasRef = React.useRef(null);
    const [outputTextLines, setOutputTextLines] = React.useState(() => [' ']);

    const [color, setColor] = React.useState('inherit');
    const [loading, setLoading] = React.useState(false);
    const [optimStatus, setOptimStatus] = React.useState(STATUS.NOT_OPT);
    const [rendering, setBulletRendering] = React.useState({ textLines: [''] });

    function getTextWidth(txt, canvas){
        const context = canvas.getContext('2d');
        context.font = '12pt Times New Roman';
        context.textAlign = 'left';
        return (context.measureText(txt).width);
     }

    // This effect updates the text rendering (i.e. enforces width constraints by inserting newlines)
    //   whenever the props text input is updated.
    React.useEffect(() => {
        
        setBulletRendering(renderBulletText(text, (txt) => getTextWidth(txt,canvasRef.current), widthPx));

    }, [text, widthPx, enableOptim]);
    // [] indicates that this happens once after the component mounts.
    // [text] indicates that this happens every time the text changes from the user (from props)

    // This effect happens after bullet rendering changes. It evaluates the rendered bullet and
    //  sees how it can be improved with modified spaces. 
    React.useEffect(() => {

        setLoading(true);
        setOutputTextLines(rendering.textLines);
        if (enableOptim) {
            const optimizer = (txt) => renderBulletText(txt, (txt) => getTextWidth(txt, canvasRef.current), widthPx);
            const optimResults = optimize(text, optimizer);
            setLoading(false);
            setOptimStatus(optimResults.status);
            setOutputTextLines(optimResults.rendering.textLines);
            
        } else {
            if(rendering.overflow < MAX_UNDERFLOW || rendering.overflow > 0){
                setOptimStatus(STATUS.FAILED_OPT);
            }else{
                setOptimStatus(STATUS.OPTIMIZED)
            }
            setOutputTextLines(rendering.textLines);
            setLoading(false);
        }

    }, [rendering, enableOptim, text, widthPx]);

    //color effect
    React.useEffect(() => {
        if (loading) {
            setColor("silver")
        } else if (optimStatus === STATUS.FAILED_OPT) {
            setColor("red");
        } else {
            setColor("black");
        }
    }, [loading, outputTextLines, optimStatus])

    // the style properties help lock the canvas in the same spot and make it essentially invisible.
    //whitespace: pre-wrap is essential as it allows javascript string line breaks to appear properly.
    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    visibility: "hidden",
                    position: "absolute",
                    top: "-1000px",
                    left: "-1000px"
                }} />
            <div style={{
                minHeight: height,
                color: color,
                display:'flex',
                flexDirection:'column',
            }} onMouseUp={onHighlight} >
                {outputTextLines.map((line)=>{
                    return <span key={line} style={{whiteSpace:"pre"}}>{line}</span>;
                })}
            </div>
        </>
    );
    //return canvas;
}


function optimize(sentence, evalFcn) {

    const smallerSpace = "\u2006";
    const largerSpace = "\u2004";

    //initialization of optimized words array
    let optWords = tokenize(sentence.trimEnd());

    const initResults = evalFcn(sentence);

    if (initResults.overflow === 0) {
        return initResults;
    }

    //initial instantiation of previousResults
    let prevResults = initResults;
    let finalResults = initResults;
    const newSpace = (initResults.overflow >= 0) ? smallerSpace : largerSpace;

    let finalOptimStatus = STATUS.NOT_OPT;

    function hashCode (str) {
        let hash = 0, i, chr;
        if (str.length === 0) return hash;
        for (i = 0; i < str.length; i++) {
          chr = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      };

    function getRandomInt(seed, max) {
        return Math.floor(Math.abs((Math.floor(9 * hashCode(seed) + 5) % 100000) / 100000) * Math.floor(max));
    }

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

    while (finalResults.overflow > 0 || finalResults.overflow < STATUS.MAX_UNDERFLOW) {
        //don't select the first space after the dash- that would be noticeable and look wierd.
        // also don't select the last word, don't want to add a space after that.
        let iReplace = getRandomInt(optWords.join(''), optWords.length - 1 - 1) + 1;

        //merges two elements together, joined by the space
        optWords.splice(
            iReplace, 2,
            optWords.slice(iReplace, iReplace + 2).join(newSpace)
        );

        //make all other spaces the normal space size
        let newSentence = optWords.join(' ');

        let newResults = evalFcn(newSentence);

        if (initResults.overflow <= 0 && newResults.overflow > 0) {
            //console.log("Note: Can't add more spaces without overflow, reverting to previous" );
            finalResults = prevResults;
            finalOptimStatus = STATUS.OPTIMIZED;
            break;
        } else if (initResults.overflow > 0 && newResults.overflow < 0) {
            //console.log("Removed enough spaces. Terminating." );
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


export default Bullet;