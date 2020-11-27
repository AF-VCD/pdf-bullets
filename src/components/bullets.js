import React from "react"
import {Editor, EditorState, RichUtils, ContentState, Modifier} from "draft-js"
import "draft-js/dist/Draft.css";
import { toSetSeq } from "draft-js/lib/DefaultDraftBlockRenderMap";
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

function BulletComparator({editorState, setEditorState, ...props}){
    
  

/*     // effect to handle replacing word 
    React.useEffect(()=>{
        // this block of code gets the selected text from the editor.
        const selectionState = editorState.getSelection();
        const currentContent = editorState.getCurrentContent();
        const newContent = Modifier.replaceText(currentContent, selectionState, props.replacedWord + ' ');
        const newEditorState = EditorState.push(editorState,newContent,'insert-characters');
        
        setEditorState(newEditorState);
    },[props.replacedWord]) */

    // Editor callback that adds rich text editor keybinds
    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if(newState){
            setEditorState(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    // Editor callback that runs whenever edits or selection changes occur.
    const onChange = (newEditorState)=>{
        
        const textChanged = editorState.getCurrentContent() !== newEditorState.getCurrentContent();
        
        //const content = editorState.getCurrentContent();
        // ordered map has a key and a block associasted with it
        //const blockMap = content.getBlockMap();
        /*
        for(let [key,block] of blockMap){
            console.log(block.getText());
        }
        */
    
        // this block of code gets the selected text from the editor.
        const selectionState = newEditorState.getSelection();
        const anchorKey = selectionState.getAnchorKey();
        const currentContent = newEditorState.getCurrentContent();
        const currentContentBlock = currentContent.getBlockForKey(anchorKey);
        const start = selectionState.getStartOffset();
        const end = selectionState.getEndOffset();
        const selectedText = currentContentBlock.getText().slice(start, end);

        if(props.onSelect && selectedText !== '') props.onSelect(selectedText);
        if(props.onTextChange && textChanged) props.handleTextChange(newEditorState.getCurrentContent().getPlainText('\n'))
        setEditorState(newEditorState);
    }

    // This other bullet selection is for when things are selected on the optimized output
    const onBulletSelect = (event)=>{
        const selection = window.getSelection().toString();
        if(selection !== ""){
            props.onSelect(selection)
        }
    }

    // TODO add control-a selectability on the bullet outputs

    /*
        selectOutput = (e)=>{
        if(e.ctrlKey && e.keyCode === 65){
            e.preventDefault();
            //console.log('control-a')
            //console.log(this.outputRef.current)
            if (window.getSelection) { 
                const range = document.createRange();
                range.selectNode(this.outputRef.current);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            }
        }
    }
    */

    return (
        <div style={{
            display:"flex",
            justifyContent: "space-around",
            alignItems:"flex-start"
        }}>
            <div >
                <Editor editorState={editorState} onChange={onChange} handleKeyCommand={handleKeyCommand}/>
            </div>
            <div onMouseUp={onBulletSelect}>
                {editorState.getCurrentContent().getBlocksAsArray().map((block, key)=>{
                    let text = block.getText();
                    if(props.abbrReplacer) text = props.abbrReplacer(text);
                    return <Bullet text={text} width={202.321*DPMM} enableOptim={props.enableOptim}/>
                })}
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



// <Bullet text={bulletText} width={widthInPixels} height={heightInPixels} enableOptim={true} onHighlight={highlightCallback} />
function Bullet(props){
    const canvasRef = React.useRef(null);
    const [outputText, setOutputText] = React.useState(' ');
    
    const [color, setColor] = React.useState('inherit');
    const [loading, setLoading] = React.useState(true);
    const [optimStatus, setOptimStatus] = React.useState(BULLET.NOT_OPT);    
    const [rendering, setBulletRendering] = React.useState({text:''});

    const getContext = (canvas)=>{
        //now we can draw in 2d here.
        const context = canvas.getContext('2d');
        context.font = '12pt AdobeTimes';
        return context;
    }

    // This effect updates the text rendering (i.e. enforces width constraints by inserting newlines)
    //   whenever the props text input is updated.
    React.useEffect(() => {
        
        const context = getContext(canvasRef.current)
        //context.fillText(props.text, 50,50);
        setBulletRendering(renderBulletText(props.text, context, props.width));

    }, [props.text]);
    // [] indicates that this happens once after the component mounts.
    // [props.text] indicates that this happens every time the text changes from the user

    // This effect happens after bullet rendering changes. It evaluates the rendered bullet and
    //  sees how it can be improved with modified spaces. 
    React.useEffect(()=>{
        
        if(props.enableOptim){
            setLoading(BULLET.LOADING);
            const optimizer = (text)=>renderBulletText(text, getContext(canvasRef.current),props.width);
            const optimResults = optimize(rendering.text, optimizer);
    
            setLoading(BULLET.DONE);
    
            setOptimStatus(optimResults.status);
            setOutputText(optimResults.rendering.text);  
               
        }else{
            setOutputText(rendering.text);   
        }

        
    },[rendering]);

    //color effect
    React.useEffect(()=>{
        if(loading){
            setColor("gray")
        }else if(optimStatus === BULLET.FAILED_OPT){
            setColor("red");
        }else{
            setColor("inherit");
        }
    }, [loading, outputText])

    // the style properties help lock the canvas in the same spot and make it essentially invisible.
    //whitespace: pre-wrap is essential as it allows javascript string line breaks to appear properly.
    return (
        <>
        <canvas 
            ref={canvasRef} 
            style={{
                visibility:"hidden", 
                position:"absolute",
                top:"-1000px",
                left: "-1000px"   
        }}/>
        <div style={{
            height:props.height,
            whiteSpace: 'pre-wrap',
            color: color,
            }} onMouseUp={props.onHighlight} >
            {outputText == '' ? ' ' : outputText}
        </div>
        </>
    );
    //return canvas;
}


function optimize(sentence, evalFcn) {
    
    const smallerSpace = "\u2006";
    const largerSpace = "\u2004";

    //initialization of optimized words array
    let optWords = BULLET.Tokenize(sentence);
    
    const initResults = evalFcn(sentence);
    
    if(initResults.overflow == 0){
        return initResults;
    }

    //initial instantiation of previousResults
    let prevResults = initResults;
    let finalResults = initResults;
    const newSpace = (initResults.overflow >= 0 )? smallerSpace: largerSpace;
    
    let finalOptimStatus = BULLET.NOT_OPT;
    
    function getRandomInt(seed,max){
        return Math.floor( Math.abs((Math.floor(9*seed.hashCode()+5) % 100000) / 100000) * Math.floor(max));
    }
    
    
    while(finalResults.overflow > 0 || finalResults.overflow < BULLET.MAX_UNDERFLOW){
        //don't select the first space after the dash- that would be noticeable and look wierd.
        // also don't select the last word, don't want to add a space after that.
        let iReplace = getRandomInt(optWords.join(''), optWords.length -1 -1) + 1;
        
        //merges two elements together, joined by the space
        optWords.splice( 
            iReplace, 2, 
            optWords.slice(iReplace,iReplace+2).join(newSpace)
        );

        //make all other spaces the normal space size
        let newSentence = optWords.join(' ');
        
        let newResults = evalFcn(newSentence);

        if(initResults.overflow <= 0 && newResults.overflow > 0){            
            //console.log("Note: Can't add more spaces without overflow, reverting to previous" );
            finalResults = prevResults;
            finalOptimStatus = BULLET.OPTIMIZED;
            break;
        } else if(initResults.overflow > 0  && newResults.overflow < 0){
            //console.log("Removed enough spaces. Terminating." );
            finalResults = newResults;
            finalOptimStatus = BULLET.OPTIMIZED;
            break;
        } else if(optWords.length <= 2){ //this conditional needs to be last
            //console.log("\tWarning: Can't replace any more spaces");
            finalResults = newResults;
            finalOptimStatus = BULLET.FAILED_OPT;
            break;
        }
        prevResults = newResults;
    } 
    return {
        status: finalOptimStatus,
        rendering: finalResults,
    };
}
        
// all widths in this function are in pixels
function renderBulletText(text, context, width){
    
    const getWidth = (txt)=> (context.measureText(txt)).width;
    const fullWidth = getWidth(text.trimEnd());
    if(fullWidth < width){
        return {
            text: text,
            fullWidth: fullWidth,
            lines: 1,
            overflow: fullWidth - width,
        };
    }else{
        // Regex- split after one of the following: \s ? / | - % ! 
        // but ONLY if immediately followed by: [a-zA-z] [0-9] + \
        const textSplit = text.split(/(?<=[\s\?\/\|\-\%\!])(?=[a-zA-Z0-9\+\\])/) ;
        
        if(textSplit.length > 1){
            let answerIdx = 0;
            for(let i = 1; i <= textSplit.length; i++){
                const evalText = textSplit.slice(0,i).join('').trimEnd();
                const evalWidth = getWidth(evalText);
                if(evalWidth > width){
                    answerIdx = i - 1;
                    break;
                }
            }
            const recursedResult = renderBulletText(textSplit.slice(answerIdx,textSplit.length).join(''), context, width);
            
            return {
                text: textSplit.slice(0,answerIdx).join('') + '\n' + recursedResult.text,
                fullWidth: fullWidth,
                lines: 1 + recursedResult.lines,
                overflow: fullWidth - width,
            }
        }else{
            //corner case where text is one long string without spaces in it.
            const avgCharWidth = fullWidth/(text.length);
            const guessIndex = parseInt(width / avgCharWidth);
            const firstGuessWidth = getWidth(text.substring(0,guessIndex)) 
            let answerIdx = guessIndex;
            if(firstGuessWidth > width){
                for(let i=guessIndex-1; i>0; i--){
                    const nextGuessWidth = getWidth(text.substring(0,i));
                    if(nextGuessWidth < width){
                        answerIdx = i;
                        break;
                    }
                }
            }else if(firstGuessWidth < width){
                for(let i=guessIndex; i <= text.length; i++){
                    
                    const nextGuessWidth = getWidth(text.substring(0,i));
                    if(nextGuessWidth > width){
                        answerIdx = i - 1;
                        break;
                    }
                }
            }
            const recursedResult = renderBulletText(text.substring(answerIdx,text.length), context, width);
            
            return {
                text: text.substring(0,answerIdx) + '\n' + recursedResult.text,
                fullWidth: fullWidth,
                lines: 1 + recursedResult.lines,
                overflow: fullWidth - width,
            }
        }
    }
}


export {Bullet, BULLET, BulletComparator, renderBulletText};