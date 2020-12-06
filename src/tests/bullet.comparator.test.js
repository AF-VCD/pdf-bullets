//TO TEST: input side
// make sure words don't get broken up at the end of the line


import { BulletComparator } from '../../src/components/bullets.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { EditorState, ContentState, Modifier, SelectionState } from "draft-js"
import { act } from "react-dom/test-utils";

const DPI = 96;
const MM_PER_IN = 25.4;
const DPMM = DPI / MM_PER_IN;

jest.mock('../../src/components/tools.js', () => {
    const Tools = jest.requireActual('../../src/components/tools.js');
    const widthMap = jest.requireActual('./12pt-times.json');
    const getWidthMock = (text) => {
        return text.split('').reduce((sum, char) => sum + widthMap[char.charCodeAt(0)], 0);
    }
    return {
        ...Tools,
        'renderBulletText':(text, getWidth, width) => Tools.renderBulletText(text, getWidthMock, width),
    }
})

let container = null;
beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    // cleanup on exiting
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    container = null;
});

// BulletComparator({editorState, setEditorState, width, onSelect, abbrReplacer, enableOptim }) 
it('renders without crashing', ()=>{

    const editorState = EditorState.createWithContent(ContentState.createFromText('some text here'));
    const setEditorState = (newState)=>newState;
    ReactDOM.render(<BulletComparator editorState={editorState} setEditorState={setEditorState} 
        widthPx={500}/>, container)
})
