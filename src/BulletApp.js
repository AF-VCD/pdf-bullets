import { useState, useEffect, useCallback } from "react";
import BulletComparator, {
  getSelectionInfo,
  findWithRegex,
} from "./components/Bullets/BulletComparator";
import { Logo, DocumentTools } from "./components/Toolbars/Toolbars";
import { tokenize } from "./components/Bullets/utils";
import AbbreviationViewer from "./components/Abbreviation/AbbreviationViewer";
import SynonymViewer from "./components/Toolbars/Thesaurus.js";
import { EditorState, ContentState, Modifier, SelectionState, CompositeDecorator } from "draft-js";
import { defaultAbbrData, defaultText, defaultWidth } from "./const/defaults";

const defaultEditorState = EditorState.createWithContent(
  ContentState.createFromText(defaultText)
);

// Note that all width measurements in this file are in millimeters.
function BulletApp({enableHighlight, onHighlightChange}) {
  const [enableOptim, setEnableOptim] = useState(true);
  const [width, setWidth] = useState(defaultWidth);
  const [abbrData, setAbbrData] = useState(defaultAbbrData);

  const [abbrDict, setAbbrDict] = useState({});

  const [selection, setSelection] = useState("");
  const [currentTab, setCurrentTab] = useState(0);
  const [showThesaurus, setShowThesaurus] = useState(false);
  const [editorState, setEditorState] = useState(defaultEditorState);

  function handleJSONImport(settingsArray) {
    const settings = settingsArray[0]; //preparing for possible eventual several tabs of stuff
    setEnableOptim(settings.enableOptim ?? enableOptim);

    // for backwards compatibility
    setWidth(parseFloat(settings.width ?? width));

    // for backwards compatibility
    if (Array.isArray(settings.abbrData[0])) {
      setAbbrData(
        settings.abbrData.map((row) => {
          return {
            enabled: row[0],
            value: row[1],
            abbr: row[2],
          };
        })
      );
    } else {
      setAbbrData(settings.abbrData ?? abbrData);
    }

    setEditorState(
      settings.editorState
        ? EditorState.fromJS(settings.editorState)
        : EditorState.createWithContent(
            ContentState.createFromText(settings.text)
          )
    );
  }

  useEffect(() => {
    let settingsArray;
    try {
      if (localStorage.getItem("bullet-settings")) {
        settingsArray = JSON.parse(localStorage.getItem("bullet-settings"));
        handleJSONImport(settingsArray);
      }
    } catch (err) {
      if (err.name === "SecurityError") {
        console.log(
          "Was not able to get localstorage bullets due to use of file interface and browser privacy settings"
        );
      } else {
        throw err;
      }
    }
  }, []);

  useEffect(() => {
    const newAbbrDict = {};

    abbrData
      .filter((row) => row.value !== null && row.abbr !== null)
      .forEach((row) => {
        //console.log(row);
        let fullWord = String(row.value).replace(/\s/g, " ");
        let abbr = row.abbr;
        let enabled = row.enabled;
        newAbbrDict[fullWord] = newAbbrDict[fullWord] || []; //initializes to empty array if necessary

        if (enabled) {
          newAbbrDict[fullWord].enabled = newAbbrDict[fullWord].enabled || [];
          newAbbrDict[fullWord].enabled.push(abbr);
        } else {
          newAbbrDict[fullWord].disabled = newAbbrDict[fullWord].disabled || [];
          newAbbrDict[fullWord].disabled.push(abbr);
        }
      });

    setAbbrDict(newAbbrDict);
  }, [abbrData]);

  

  const abbrReplacer = useCallback(
    (sentence) => {
      const finalAbbrDict = {};
      //console.log(abbrDict);
      Object.keys(abbrDict).forEach((word) => {
        const abbrs = abbrDict[word]; //an array
        //if there is at least one enabled abbreviation, take the lowest most element of it.
        if (abbrs.enabled) {
          finalAbbrDict[word] = abbrs.enabled[abbrs.enabled.length - 1];
        }
      });

      // courtesy of https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
      function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
      }

      let modifiers = "g";
      const allApprovedAbbrs = Object.keys(finalAbbrDict)
        .map(escapeRegExp)
        .join("|");

      // some info on the boundary parts of the regex:
      // (^|\\W|\\b)
      //     ^ - ensures words at the beginning of line are considered for abbreviation
      //     \\W - expects abbr to be preceded by a non-word, i.e. a space, semicolon, dash, etc.
      //     \\b - also check for word boundaries, this is necessary for edge cases like 'f/ ' and 'w/ '.
      //            Otherwise things like 'with chicken' and 'for $2M' won't resolve to 'w/chicken' and 'f/$2M'.
      // (\\W|\\b|$)
      //     \\W, \\b - see above
      //     $ - ensures words at end of line are considered for abbreviation
      const regExp = new RegExp(
        "(^|\\W|\\b)(" + allApprovedAbbrs + ")(\\W|\\b|$)",
        modifiers
      );
      const newSentence = sentence.replace(regExp, (match, p1, p2, p3) => {
        //p2 = p2.replace(/ /g,'\\s')
        let abbr = finalAbbrDict[p2];
        if (!abbr) {
          abbr = "";
        }
        return p1 + abbr + p3;
      });
      return newSentence;
    },
    [abbrDict]
  );

  function handleOptimChange() {
    setEnableOptim(!enableOptim);
  }

  function handleEnableHighlight() {
    // console.log("handleEnableHighlight fired");
    // console.log(enableHighlight);
    const contentState = editorState.getCurrentContent();
    if (enableHighlight === false) {
      let bulletText = contentState.getPlainText();
      let userInput = bulletText.split(/\s|;|--|\//);
      let findDuplicates = userInput => userInput.filter((item, index) => (userInput.indexOf(item) !== index && item.length > 1));
      let duplicates = findDuplicates(userInput);
      duplicates = [...new Set(duplicates)];

      function handleHighlightClick(e) {
        let yellowSpans = document.getElementsByClassName('yellow-highlight');
        // console.log(yellowSpans);
        // console.log(e.target);
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
      setEditorState(EditorState.set(editorState, {decorator: createDecorator()}));
    } else {
      setEditorState(EditorState.set(editorState, {decorator: null}));
    }
  }


  function handleSelect(newSel) {
    // console.log(newSel + " " + enableHighlight);
    const maxWords = 8;
    if (newSel.trim() !== "") {
      setSelection(tokenize(newSel.trim()).slice(0, maxWords).join(" "));
    }
  }

  function handleTextNorm() {
    const selectionsToReplace = [];
    const contentState = editorState.getCurrentContent();
    contentState.getBlockMap().forEach((block, key) => {
      findWithRegex(/\s+/g, block, (anchorOffset, focusOffset) => {
        const selection = SelectionState.createEmpty(key).merge({
          anchorOffset,
          focusOffset,
        });
        selectionsToReplace.push(selection);
      });
    });

    let newContentState = contentState;
    // need to reverse the selections list, because otherwise as the newContentState is iteratively changed,
    //  subsequent selections will get shifted and get all jacked up. This problem can be avoided by going backwards.
    selectionsToReplace.reverse().forEach((selection) => {
      newContentState = Modifier.replaceText(newContentState, selection, " ");
    });

    setEditorState(EditorState.createWithContent(newContentState));
  }
  function handleTextUpdate(newText) {
    setEditorState(
      EditorState.createWithContent(ContentState.createFromText(newText))
    );
  }

  function handleSave() {
    return {
      width: width,
      text: editorState.getCurrentContent().getPlainText("\n"),
      editorState: editorState.toJS(),
      abbrData: abbrData,
      enableOptim: enableOptim,
    };
  }
  function handleTabChange(newTab) {
    return () => setCurrentTab(newTab);
  }
  function handleThesaurusHide() {
    setShowThesaurus(!showThesaurus);
  }
  function handleSelReplace(word) {
    if (document.activeElement.className.match(/public-DraftEditor-content/)) {
      const {
        selectedText,
        start,
        anchorKey,
        selectionState,
      } = getSelectionInfo(editorState);

      const trailingSpaces = selectedText.match(/\s*$/)[0];
      const newEnd = start + word.length + trailingSpaces.length;

      const newSelectionState = SelectionState.createEmpty(anchorKey).merge({
        anchorOffset: start,
        focusOffset: newEnd,
      });

      const newContent = Modifier.replaceText(
        editorState.getCurrentContent(),
        selectionState,
        word + trailingSpaces
      );
      const newEditorState = EditorState.push(
        editorState,
        newContent,
        "insert-characters"
      );
      const newEditorStateSelect = EditorState.forceSelection(
        newEditorState,
        newSelectionState
      );

      setEditorState(newEditorStateSelect);
      const contentState = newEditorStateSelect.getCurrentContent();
      // console.log(enableHighlight);
      if (enableHighlight === true) {
        let bulletText = contentState.getPlainText();
        let userInput = bulletText.split(/\s|;|--|\//);
        let findDuplicates = userInput => userInput.filter((item, index) => (userInput.indexOf(item) !== index && item.length > 1));
        let duplicates = findDuplicates(userInput);
        duplicates = [...new Set(duplicates)];
      
        function handleHighlightClick(e) {
          let yellowSpans = document.getElementsByClassName('yellow-highlight');
          // console.log(yellowSpans);
          // console.log(e.target);
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
  
          setEditorState(EditorState.set(newEditorStateSelect, {decorator: createDecorator()}));
          
        } else {

          setEditorState(EditorState.set(newEditorStateSelect, {decorator: null})); 
        }
    }
    
  }

  const tabs = ["Bullets", "Abbreviations"];
  const tabContents = [
    <BulletComparator
      editorState={editorState}
      setEditorState={setEditorState}
      abbrReplacer={abbrReplacer}
      width={width}
      onSelect={handleSelect}
      enableOptim={enableOptim}
      enableHighlight={enableHighlight}
      onHighlightChange={onHighlightChange}
      handleEnableHighlight={handleEnableHighlight}
    />,
    <AbbreviationViewer data={abbrData} setData={setAbbrData} />,
  ];

  return (
    <div className="container is-fluid">
      <div className="columns is-multiline">
        <div className="column is-full">
          <Logo />
          <DocumentTools
            enableOptim={enableOptim}
            enableHighlight={enableHighlight}
            onOptimChange={handleOptimChange}
            onHighlightChange={onHighlightChange}
            handleEnableHighlight={handleEnableHighlight}
            width={width}
            onWidthUpdate={setWidth}
            onTextNorm={handleTextNorm}
            onTextUpdate={handleTextUpdate}
            getSavedSettings={handleSave}
            onJSONImport={handleJSONImport}
            onThesaurusHide={handleThesaurusHide}
          />
        </div>

        <div className={"column is-full " + (showThesaurus ? "" : "is-hidden")}>
          <SynonymViewer
            word={selection}
            onSelReplace={handleSelReplace}
            abbrDict={abbrDict}
            abbrReplacer={abbrReplacer}
            onHide={handleThesaurusHide}
          />
        </div>
        <div className="column is-full">
          <div className="tabs">
            <ul>
              {tabs.map((tab, i) => {
                return (
                  <li key={i} className={currentTab === i ? "is-active" : ""}>
                    <a onClick={handleTabChange(i)}>{tab}</a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="column is-full">{tabContents[currentTab]}</div>
      </div>
    </div>
  );
}

export default BulletApp;
