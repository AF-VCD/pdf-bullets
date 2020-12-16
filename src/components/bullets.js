import React from "react"
import { Editor,  RichUtils } from "draft-js"
import "draft-js/dist/Draft.css";
import { getSelectionInfo, renderBulletText } from './tools.js'
const DPI = 96;
const MM_PER_IN = 25.4;
const DPMM = DPI / MM_PER_IN;


// optimization status codes
// status codes for optimization direction 
// had to move this to a floating object because MS Edge doesn't support static variables
const BULLET = {
    OPTIMIZED: 0,
    FAILED_OPT: 1,
    NOT_OPT: -1,
    ADD_SPACE: 1,
    REM_SPACE: -1,
    MAX_UNDERFLOW: -4,
    Tokenize: (sentence) => {
        return sentence.split(/[\s]+/);
    },
}


function BulletComparator({editorState, setEditorState, width, onSelect, abbrReplacer, enableOptim }) {
    
    const bulletOutputID = "bulletOutput";
    const [heightMap, setHeightMap] = React.useState(new Map());
    // Editor callback that adds rich text editor keybinds
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    // Editor callback that runs whenever edits or selection changes occur.
    const onChange = (newEditorState) => {

        //const content = editorState.getCurrentContent();
        // ordered map has a key and a block associasted with it
        //const blockMap = content.getBlockMap();
        /*
        for(let [key,block] of blockMap){
            console.log(block.getText());
        }
        */
        const { selectedText } = getSelectionInfo(newEditorState)
        if (onSelect && selectedText !== '') onSelect(selectedText);
        
        setEditorState(newEditorState);
    }

    // This other bullet selection is for when things are selected on the optimized output
    const onBulletSelect = (event) => {
        const selection = window.getSelection().toString();
        if (selection !== "") {
            onSelect(selection)
        }
    }

    // control-a selectability on bullet outputs
    function selectOutput(e) {
        if (e.ctrlKey && e.keyCode === 65) {
            e.preventDefault();
            //console.log('control-a')
            //console.log(this.outputRef.current)
            if (e.target.id.match(new RegExp(bulletOutputID))) {
                const range = document.createRange();
                range.selectNode(e.target);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            }
        }
    }

    React.useEffect(()=>{
        let newHeightMap = new Map();
        for(let key of editorState.getCurrentContent().getBlockMap().keys()){
            const blockDiv = document.querySelector(`div[data-offset-key="${key}-0-0"]`);
            if(blockDiv) newHeightMap.set(key, blockDiv.getBoundingClientRect().height);
        };
        setHeightMap(newHeightMap);
    },[editorState])

    return (
        <div className="bullets columns is-multiline" >
            <div className="column" style={{
                // width: width + 'mm',
            }}>
                <h2 className='subtitle'>Input Bullets Here:</h2>
                <div className="border" style={{ width: (width+1) + 'mm'}}>
                    <Editor 
                        editorState={editorState} onChange={onChange} handleKeyCommand={handleKeyCommand} />
                </div>
            </div>
            <div className="column" >
                <h2 className='subtitle'>View Output Here:</h2>
                <div className="border" id={bulletOutputID} style={{ width: (width+1) + 'mm' }}
                    onMouseUp={onBulletSelect} onKeyDown={selectOutput} tabIndex="0">
                    {Array.from(editorState.getCurrentContent().getBlockMap(), ([key, block]) => {
                        let text = block.getText();
                        if (abbrReplacer) text = abbrReplacer(text);
                        
                        return <Bullet key={key} text={text} widthPx={ width * DPMM } height={heightMap.get(key)} 
                            enableOptim={enableOptim} />
                    })}
                </div>
            </div>
        </div>);
}
/*
            <div>
                {editorState.getCurrentContent().getBlocksAsArray().map((block, key)=>{
                    return <Bullet text={block.getText()} width={202.321*DPMM}/>
                })}
            </div>

*/



function Bullet({ text="", widthPx=500, enableOptim=false, height, onHighlight }) {
    const canvasRef = React.useRef(null);
    const [outputTextLines, setOutputTextLines] = React.useState(() => [' ']);

    const [color, setColor] = React.useState('inherit');
    const [loading, setLoading] = React.useState(false);
    const [optimStatus, setOptimStatus] = React.useState(BULLET.NOT_OPT);
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
            if(rendering.overflow < BULLET.MAX_UNDERFLOW || rendering.overflow > 0){
                setOptimStatus(BULLET.FAILED_OPT);
            }else{
                setOptimStatus(BULLET.OPTIMIZED)
            }
            setOutputTextLines(rendering.textLines);
            setLoading(false);
        }

    }, [rendering, enableOptim, text, widthPx]);

    //color effect
    React.useEffect(() => {
        if (loading) {
            setColor("silver")
        } else if (optimStatus === BULLET.FAILED_OPT) {
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
    let optWords = BULLET.Tokenize(sentence.trimEnd());

    const initResults = evalFcn(sentence);

    if (initResults.overflow === 0) {
        return initResults;
    }

    //initial instantiation of previousResults
    let prevResults = initResults;
    let finalResults = initResults;
    const newSpace = (initResults.overflow >= 0) ? smallerSpace : largerSpace;

    let finalOptimStatus = BULLET.NOT_OPT;

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
            (newSpace === largerSpace && worstCaseResults.overflow < BULLET.MAX_UNDERFLOW) ){
            // this means that there is no point in trying to optimize.
            
            return {
                status: BULLET.FAILED_OPT,
                rendering: worstCaseResults,
            };
        
    }

    while (finalResults.overflow > 0 || finalResults.overflow < BULLET.MAX_UNDERFLOW) {
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
            finalOptimStatus = BULLET.OPTIMIZED;
            break;
        } else if (initResults.overflow > 0 && newResults.overflow < 0) {
            //console.log("Removed enough spaces. Terminating." );
            finalResults = newResults;
            finalOptimStatus = BULLET.OPTIMIZED;
            break;
        }
        
        prevResults = newResults;
    }
    return {
        status: finalOptimStatus,
        rendering: finalResults,
    };
}


export { Bullet, BULLET, BulletComparator };