
import Bullet from '../../src/components/Bullet.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { render, screen } from '@testing-library/react';

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
//Bullet({ text, widthPx, enableOptim, height, onHighlight }) 

it('renders without crashing', ()=>{
    render(<Bullet text={'test'} widthPx={500}/>, container)
})

it('renders without any arguments', () => {
    render(<Bullet />, container);
})

it('renders when the width is undefined ', ()=>{
    render(<Bullet text={"A little bit of text"}/>, container)
})

it("should render a short bullet all on one line", () => {
    const text = '- This is a short bullet that should fit on one line.';
    const widthPx = 202.321 * DPMM;

    render(
        <Bullet text={text} widthPx={widthPx}  />
        , container);

    
    expect(screen.getByText(/\w+/).textContent).toEqual(text)
});


it("should render a perfect sized bullet all on one line without optimiziation", () => {
    const text = "- This line should render on exactly one line, assuming 60 DPI, 12 pt Times New Roman font and a 202.321 mm width";
    const widthPx = 202.321 * DPMM;
    const enableOptim = false;

    render(
        <Bullet text={text} widthPx={widthPx} enableOptim={enableOptim}/>
        , container);

    expect(screen.getByText(/\w+/).textContent).toEqual(text)
});

it("should render a perfect sized bullet all on one line without optimiziation, even with spaces at the end", () => {
    const text = "- This line should render on exactly one line, assuming 60 DPI, 12 pt Times New Roman font and a 202.321 mm width                                                 ";
    const widthPx = 202.321 * DPMM;
    const enableOptim = false;

    render(
        <Bullet text={text} widthPx={widthPx} enableOptim={enableOptim}/>
        , container);

    expect(screen.getByText(/\w+/).textContent).toEqual(text)
});

it("should render a slightly multiline bullet all on one line with optimiziation, and it should be colored black", () => {
    const text = "- This line should optimize to fit on exactly one line, using 2006 Unicode spaces in place of the regular ones to compress";
    const widthPx = 202.321 * DPMM;
    const enableOptim = true;

    render(
        <Bullet text={text} widthPx={widthPx} enableOptim={enableOptim}/>
        , container);

    
    expect(screen.getAllByText(/\w+/).length).toEqual(1)
    screen.getAllByText(/\w+/).map((el)=>{
        expect(el.parentElement.style).toMatchObject({color:'black'})
    })
});

it("should appear as red if an optimized bullet is longer than one line", () => {
    const text = "- This bullet should be a little bit longer than a line, due to the fact that I am typing all of these words to fill up the space of the bullet.";
    const widthPx = 202.321 * DPMM;
    const enableOptim = true;

    render(
        <Bullet text={text} widthPx={widthPx} enableOptim={enableOptim}/>
        , container);

    
    expect(screen.getAllByText(/\w+/).length).toEqual(2)
    screen.getAllByText(/\w+/).map((el)=>{
        expect(el.parentElement.style).toMatchObject({color:'red'})
    })
    
});

it("should appear as red if an un-optimized bullet is longer than one line", () => {
    const text = "- This bullet should be a little bit longer than a line, due to the fact that I am typing all of these words to fill up the space of the bullet.";
    const widthPx = 202.321 * DPMM;
    const enableOptim = false;

    render(
        <Bullet text={text} widthPx={widthPx} enableOptim={enableOptim}/>
        , container);

    
    expect(screen.getAllByText(/\w+/).length).toEqual(2)
    screen.getAllByText(/\w+/).map((el)=>{
        expect(el.parentElement.style).toMatchObject({color:'red'})
    })
});

it("should render a slightly shorter bullet expanded out to minimize whitespace optimiziation, and it should be colored black", () => {
    const text = "- This line should optimize to fit on exactly one line, using 2004 Unicode spaces in place of regular spaces to fill space";
    const widthPx = 202.321 * DPMM;
    const enableOptim = true;

    render(
        <Bullet text={text} widthPx={widthPx} enableOptim={enableOptim}/>
        , container);

    
    expect(screen.getAllByText(/\w+/).length).toEqual(1)
    screen.getAllByText(/\w+/).map((el)=>{
        expect(el.parentElement.style).toMatchObject({color:'black'})
    })
});