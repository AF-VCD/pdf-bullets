//TO TEST: input side
// make sure words don't get broken up at the end of the line


import BulletComparator from '../../src/components/BulletComparator.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { EditorState, ContentState, Modifier, SelectionState } from "draft-js"
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'


const DPI = 96;
const MM_PER_IN = 25.4;
const DPMM = DPI / MM_PER_IN;

jest.mock('../../src/components/Tools.js', () => {
    const Tools = jest.requireActual('../../src/components/Tools.js');
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
    render(<BulletComparator editorState={editorState} setEditorState={setEditorState} 
        width={202.321}/>, container)
})

// BulletComparator({editorState, setEditorState, width, onSelect, abbrReplacer, enableOptim }) 
it('contains the correct text when rendered with initialized content', ()=>{
    const text = 'some text here'
    const editorState = EditorState.createWithContent(ContentState.createFromText(text));
    const setEditorState = (newState)=>newState;
    render(<BulletComparator editorState={editorState} setEditorState={setEditorState} 
        width={202.321}/>, container);
    
    expect(screen.queryAllByText(new RegExp(text)).length).toEqual(2)
    screen.queryAllByText(new RegExp(text)).map(el=>{
        expect(el.textContent).toEqual(text);
    })
})

it('contains the correct text when rendered with lots of initialized content', ()=>{
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    const editorState = EditorState.createWithContent(ContentState.createFromText(text));
    const setEditorState = (newState)=>newState;
    render(<BulletComparator editorState={editorState} setEditorState={setEditorState} 
        width={202.321}/>, container);
    
    expect(screen.getByRole('textbox').textContent).toEqual(text)
    screen.queryAllByText(new RegExp(text)).map(el=>{
        expect(el.textContent).toEqual(text);
    })
})

// test control-a highlighting bullet outputs

// test highlighting phrases to callback

/*
it('changes editor text appropriately when the user clickety-clacks on the keyboard', ()=>{
    const editorState = EditorState.createWithContent(ContentState.createFromText(''));
    const setEditorState = (newState)=>newState;
    render(<BulletComparator editorState={editorState} setEditorState={setEditorState} 
        width={202.321}/>, container);
    const text = 'Hello, World!'
    // https://github.com/testing-library/user-event#typeelement-text-options
    // JSDOM DOESN'T SUPPORT CONTENTEDITABLE!
    userEvent.type(screen.getByRole('textbox'), text);
    expect(screen.getByRole('textbox').textContent).toEqual('');
    
})
*/