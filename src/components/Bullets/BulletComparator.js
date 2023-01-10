import { useState, useEffect } from "react";
import { Editor, RichUtils, CompositeDecorator, EditorState } from "draft-js";
import "draft-js/dist/Draft.css";
import Bullet from "./Bullet";


const DPI = 96;
const MM_PER_IN = 25.4;
const DPMM = DPI / MM_PER_IN;

export default function BulletComparator({
  editorState,
  setEditorState,
  width,
  onSelect,
  abbrReplacer,
  enableOptim,
  enableHighlight,
  onHighlightChange,
}) {
  const bulletOutputID = "bulletOutput";
  const [heightMap, setHeightMap] = useState(new Map());
  // Editor callback that adds rich text editor keybinds
  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  // Editor callback that runs whenever edits or selection changes occur.
  const onChange = (newEditorState) => {

    let oldContentState = editorState.getCurrentContent();
    let newContentState = newEditorState.getCurrentContent();

    if (oldContentState !== newContentState) {
      const contentState = newEditorState.getCurrentContent();
      if (enableHighlight === true) {
        let bulletText = contentState.getPlainText();
        let userInput = bulletText.split(/\s|;|--|\//);
        let findDuplicates = userInput => userInput.filter((item, index) => (userInput.indexOf(item) !== index && item.length > 1));
        let duplicates = findDuplicates(userInput);
        duplicates = [...new Set(duplicates)];
      
        function handleHighlightClick(e) {
          let yellowSpans = document.getElementsByClassName('yellow-highlight');
          console.log(yellowSpans);
          console.log(e.target);
          for (let span of yellowSpans) {
            if (e.target.innerText == span.outerText) {
              if (span.style.background == 'yellow') {
                span.style.background = 'LawnGreen';
              } else {
                span.style.background = 'yellow';
              }
            }
          }
        }
  
        const Decorated = ( {children} ) => {
          return <span className={"yellow-highlight"} onClick={handleHighlightClick} style={{ background: "yellow", cursor: "pointer" }}>{children}</span>;
        };
  
        function findWithRegex(duplicates, contentBlock, callback) {
          const text = contentBlock.getText();
        
          duplicates.forEach(word => {
            const matches = [...text.matchAll(word)];
            matches.forEach(match =>
              callback(match.index, match.index + match[0].length)
            );
          });
        }
  
        function handleStrategy(contentBlock, callback) {
          findWithRegex(duplicates, contentBlock, callback);
        }
  
        const createDecorator = () =>
          new CompositeDecorator([
            {
              strategy: handleStrategy,
              component: Decorated
            }
          ]);
  
          const { selectedText } = getSelectionInfo(newEditorState);
          if (onSelect && selectedText !== "") onSelect(selectedText);
  
          setEditorState(EditorState.set(newEditorState, {decorator: createDecorator()}));
          
        } else {
  
          const { selectedText } = getSelectionInfo(newEditorState);
          if (onSelect && selectedText !== "") onSelect(selectedText);
          
          setEditorState(EditorState.set(newEditorState, {decorator: null})); 
        }
    } else {
      setEditorState(newEditorState);
      const { selectedText } = getSelectionInfo(newEditorState);
      if (onSelect && selectedText !== "") onSelect(selectedText);
    }


 

  };

  // This other bullet selection is for when things are selected on the optimized output
  const onBulletSelect = (event) => {
    const selection = window.getSelection().toString();
    if (selection !== "") {
      onSelect(selection);
    }
  };

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

  useEffect(() => {
    let newHeightMap = new Map();
    for (let key of editorState.getCurrentContent().getBlockMap().keys()) {
      const blockDiv = document.querySelector(
        `div[data-offset-key="${key}-0-0"]`
      );
      if (blockDiv)
        newHeightMap.set(key, blockDiv.getBoundingClientRect().height);
    }
    setHeightMap(newHeightMap);
  }, [editorState]);

  return (
    <div className="bullets columns is-multiline">
      <div
        className="column"
        style={
          {
            // width: width + 'mm',
          }
        }
      >
        <h2 className="subtitle">Input Bullets Here:</h2>
        <div className="border" style={{ width: width + 1 + "mm" }}>
          <Editor
            editorState={editorState}
            onChange={onChange}
            handleKeyCommand={handleKeyCommand}
            stripPastedStyles={true}
            spellCheck={true}
            autoCorrect={"off"}
            enableHighlight={enableHighlight}
            onHighlightChange={onHighlightChange}
          />
        </div>
      </div>
      <div className="column">
        <h2 className="subtitle">View Output Here:</h2>
        <div
          className="border"
          id={bulletOutputID}
          style={{ width: width + 1 + "mm" }}
          onMouseUp={onBulletSelect}
          onKeyDown={selectOutput}
          tabIndex="0"
        >
          {Array.from(
            editorState.getCurrentContent().getBlockMap(),
            ([key, block]) => {
              let text = block.getText();
              if (abbrReplacer) text = abbrReplacer(text);

              return (
                <Bullet
                  key={key}
                  text={text}
                  widthPx={width * DPMM}
                  height={heightMap.get(key)}
                  enableOptim={enableOptim}
                />
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

export const getSelectionInfo = (editorState) => {
  // this block of code gets the selected text from the editor.
  const selectionState = editorState.getSelection();
  const anchorKey = selectionState.getAnchorKey();
  const contentBlock = editorState
    .getCurrentContent()
    .getBlockForKey(anchorKey);
  const start = selectionState.getStartOffset();
  const end = selectionState.getEndOffset();
  const selectedText = contentBlock.getText().slice(start, end);
  return {
    selectionState,
    anchorKey,
    contentBlock,
    start,
    end,
    selectedText,
  };
};

export const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText();
  let matchArr, start, end;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    end = start + matchArr[0].length;
    callback(start, end);
  }
};
