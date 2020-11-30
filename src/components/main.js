import React from "react"
import { BULLET, BulletComparator } from "./bullets.js"
import { Logo, DocumentTools, getSelectionInfo, findWithRegex} from "./tools.js"
import AbbrsViewer from "./abbrs.js"
import SynonymViewer from "./thesaurus.js"
// booleans for debugging
import { EditorState, ContentState, Modifier, SelectionState } from "draft-js"

// Note that all width measurements in this file are in millimeters.
function BulletApp({ initialText, initialWidth, initialAbbrData }) {

    const [enableOptim, setEnableOptim] = React.useState(true);
    const [width, setWidth] = React.useState(initialWidth);
    const [abbrData, setAbbrData] = React.useState(React.useMemo(() => initialAbbrData));

    const [abbrDict, setAbbrDict] = React.useState({});
    
    const [selection, setSelection] = React.useState('');
    const [currentTab, setCurrentTab] = React.useState(0);
    const [showThesaurus, setShowThesaurus] = React.useState(false);
    const [editorState, setEditorState] = React.useState(
        EditorState.createWithContent(ContentState.createFromText(initialText)));

    function handleJSONImport(settings) {
        setEditorState(EditorState.createWithContent(ContentState.createFromText(settings.text)))
        setEnableOptim(settings.enableOptim);
        setWidth(settings.width);
        setAbbrData(settings.abbrData);
    }

    React.useEffect(() => {
        const newAbbrDict = {};
        abbrData.map((row) => {
            let fullWord = String(row.value).replace(/\s/g, ' ');
            let abbr = row.abbr;
            let enabled = row.enabled;
            newAbbrDict[fullWord] = newAbbrDict[fullWord] || []; //initializes to empty array if necessary

            if (enabled) {
                newAbbrDict[fullWord].enabled = newAbbrDict[fullWord].enabled || [];
                newAbbrDict[fullWord].enabled.push(abbr)
            } else {
                newAbbrDict[fullWord].disabled = newAbbrDict[fullWord].disabled || [];
                newAbbrDict[fullWord].disabled.push(abbr)
            }
        })

        setAbbrDict(newAbbrDict);
    }, [abbrData]);

    const abbrReplacer = React.useCallback((sentence) => {

            const finalAbbrDict = {};
            Object.keys(abbrDict).map(
                (word) => {
                    const abbrs = abbrDict[word]; //an array
                    //if there is at least one enabled abbreviation, take the lowest most element of it.
                    if (abbrs.enabled) {
                        finalAbbrDict[word] = abbrs.enabled[abbrs.enabled.length - 1];
                    }
                }
            )

            // courtesy of https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex 
            function escapeRegExp(string) {
                return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
            }

            let modifiers = 'g';
            const allApprovedAbbrs = Object.keys(finalAbbrDict).map(escapeRegExp).join('|');

            // some info on the boundary parts of the regex:
            // (^|\\W|\\b) 
            //     ^ - ensures words at the beginning of line are considered for abbreviation
            //     \\W - expects abbr to be preceded by a non-word, i.e. a space, semicolon, dash, etc.
            //     \\b - also check for word boundaries, this is necessary for edge cases like 'f/ ' and 'w/ '.
            //            Otherwise things like 'with chicken' and 'for $2M' won't resolve to 'w/chicken' and 'f/$2M'.
            // (\\W|\\b|$)
            //     \\W, \\b - see above
            //     $ - ensures words at end of line are considered for abbreviation
            const regExp = new RegExp("(^|\\W|\\b)(" + allApprovedAbbrs + ")(\\W|\\b|$)", modifiers);
            const newSentence = sentence.replace(regExp,
                (match, p1, p2, p3) => {
                    //p2 = p2.replace(/ /g,'\\s')
                    let abbr = finalAbbrDict[p2];
                    if (!abbr) {
                        abbr = '';
                    }
                    return p1 + abbr + p3;
                }
            );
            return newSentence;
        }
    , [abbrDict])


    function handleOptimChange() {
        setEnableOptim(!enableOptim);
    }
    function handleSelect(newSel) {
        const maxWords = 8;
        if (newSel.trim() !== '') {
            setSelection(BULLET.Tokenize(newSel.trim()).slice(0, maxWords).join(' '));
        }

    }

    function handleWidthChange(e) {
        setWidth(parseFloat(e.target.value))
    }
    function handleTextNorm() {
        
        const selectionsToReplace = [];
        const contentState = editorState.getCurrentContent();
        contentState.getBlockMap().forEach((block, key)=>{
            findWithRegex(/\s+/g, block, (anchorOffset, focusOffset) =>{
                const selection = SelectionState.createEmpty(key).merge({anchorOffset, focusOffset});
                selectionsToReplace.push(selection);
            });
        });
        
        let newContentState = contentState;
        // need to reverse the selections list, because otherwise as the newContentState is iteratively changed, 
        //  subsequent selections will get shifted and get all jacked up. This problem can be avoided by going backwards.
        selectionsToReplace.reverse().forEach(selection => {
            newContentState = Modifier.replaceText(newContentState, selection, ' ');
        });

        setEditorState(EditorState.createWithContent(newContentState));


    }
    function handleTextUpdate(newText) {
        return () => setEditorState(EditorState.createWithContent(ContentState.createFromText(newText)));
    }
    function handleWidthUpdate(newWidth) {
        return () => setWidth(newWidth);
    }
    function handleSave() {

        return {
            width: width,
            text: editorState.getCurrentContent().getPlainText('\n'),
            abbrData: abbrData,
            enableOptim: enableOptim,
        }
    }
    function handleTabChange(newTab) {
        return () => setCurrentTab(newTab);
    }
    function handleThesaurusHide() {
        setShowThesaurus(!showThesaurus)
    }
    function handleSelReplace(word) {

        if (document.activeElement.className.match(/public-DraftEditor-content/)) {

            const { selectedText, start, anchorKey, selectionState } = getSelectionInfo(editorState);

            const trailingSpaces = selectedText.match(/\s*$/)[0];
            const newEnd = start + word.length + trailingSpaces.length;

            const newSelectionState = SelectionState.createEmpty(anchorKey).merge({
                anchorOffset: start,
                focusOffset: newEnd,
            })

            const newContent = Modifier.replaceText(editorState.getCurrentContent(), selectionState, word + trailingSpaces);
            const newEditorState = EditorState.push(editorState, newContent, 'insert-characters');
            const newEditorStateSelect = EditorState.forceSelection(newEditorState, newSelectionState);

            setEditorState(newEditorStateSelect);
        };
    }

    const tabs = ['Bullets', 'Abbreviations'];
    const tabContents = [
    <BulletComparator 
        editorState={editorState}
        setEditorState={setEditorState}
        abbrReplacer={abbrReplacer} 
        width={width}
        onSelect={handleSelect} enableOptim={enableOptim} />,
    <AbbrsViewer
        data={abbrData}
        setData={setAbbrData} />
    ];
    
    return (

        <div className="container is-fluid">
            <div className='columns is-multiline'>
                <div className='column is-full'>
                    <Logo />
                    <DocumentTools
                        enableOptim={enableOptim}
                        onOptimChange={handleOptimChange}
                        width={width} onWidthChange={handleWidthChange}
                        onWidthUpdate={handleWidthUpdate}
                        onTextNorm={handleTextNorm}
                        onTextUpdate={handleTextUpdate}
                        onSave={handleSave}
                        onJSONImport={handleJSONImport}
                        onThesaurusHide={handleThesaurusHide}
                    />
                </div>

                <div className={'column is-full' + ' ' + (showThesaurus ? "" : "is-hidden")}>
                    <SynonymViewer word={selection} onSelReplace={handleSelReplace} abbrDict={abbrDict} abbrReplacer={abbrReplacer}
                        onHide={handleThesaurusHide} />
                </div>
                <div className="column is-full">
                    <div className="tabs">
                        <ul>
                            {tabs.map((tab, i) => {
                                return (
                                    <li key={i} className={currentTab === i ? "is-active" : ''} ><a onClick={handleTabChange(i)}>{tab}</a></li>
                                )
                            }
                            )}
                        </ul>
                    </div>
                </div>
                <div className='column is-full'>
                    {tabContents[currentTab]}
                </div>
            </div>
        </div>

    );
}

export default BulletApp;