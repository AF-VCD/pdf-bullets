import widthMap from  "../../static/12pt-times.json"
import {renderBulletText} from './utils';
import React from 'react';
import ReactDOM from 'react-dom';
import { render, screen } from '@testing-library/react';
// add custom jest matchers from jest-dom


const DPI = 96;
const MM_PER_IN = 25.4;
const DPMM = DPI / MM_PER_IN;

function getWidth(text){
    return text.split('').reduce( (sum, char) => sum+widthMap[char.charCodeAt(0)] , 0 );
}

// This is like a pared down version of the Bullet function, specifically to test evaluator capabilities
function RenderBulletTextTester(props){
    const canvasRef = React.useRef(null);
    const [results, setResults] = React.useState(['']);
    // width fudge factor here helps fix discrepancy between HTML and PDF forms
    const widthAdjusted = props.width + 0.55;
    React.useEffect(() => {
        
        //context.fillText(props.text, 50,50); 
        setResults(renderBulletText(props.text, getWidth, widthAdjusted).textLines)
    }, [props.text]);
    // [] indicates that this happens once after the component mounts.
    // [props.text] indicates that this happens every time the text changes.
    
    // the style properties help lock the canvas in the same spot and make it essentially invisible.
    const canvas = <canvas 
        ref={canvasRef} 
        style={{
            visibility:"hidden", 
            position:"absolute",
            top:"0px",
            left: "0px"   
        }}/>;

    return (
        <>
            {canvas}
            <div  >
                <pre data-testid={props.id}>
                    {results.join('\n')}
                </pre>
            </div>
        </>
    );
    //return canvas;
}

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

describe('checking AF1206 bullets', () => {
    const width = 202.321 * DPMM ;

    it('evaluates various bullets properly', ()=>{

        let bullets = [];
        
        

        bullets.push({
            id:'short',
            input: 'this bullet is short and shouldn\'t have line breaks',
            answer:  'this bullet is short and shouldn\'t have line breaks'
        })

        bullets.push({
            id:'i_172',
            input: 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii',
            answer:  'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii'
        })

        bullets.push({
            id:'i_173',
            input: 'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii',
            answer:  
                'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii'
                + '\ni'
        });

        bullets.push({
            id:'gibberish',
            input: 'asdfasdfjkalsdjfioasdfjioasdfas8df908asdfuas89djf89ashdfiasndfjinasdf9jas890dfj90asdf90as90df90asdf90asdf90asdf99999999',
            answer: 'asdfasdfjkalsdjfioasdfjioasdfas8df908asdfuas89djf89ashdfiasndfjinasdf9jas890dfj90asdf90as90df90asdf90asdf90asdf9\n9999999'
        });

        bullets.push({
            id:"long1",
            input:"this bullet is really long and definitely should have multiple line breaks-- chicken duck air force cyber EW space force chair force computer error seven swords zelda mario turtle frog dinosaur zebra disaster asteroid aliens frog chicken  hello world after chicken birthday party computer error seven swords zelda mario turtle frog dinosaur zebra disaster asteroid aliens frog chicken",
            answer:"this bullet is really long and definitely should have multiple line breaks-- chicken duck air force cyber EW space force \nchair force computer error seven swords zelda mario turtle frog dinosaur zebra disaster asteroid aliens frog chicken  \nhello world after chicken birthday party computer error seven swords zelda mario turtle frog dinosaur zebra disaster \nasteroid aliens frog chicken"
        })

        render(
            <>
                {bullets.map((entry)=>{
                    return < RenderBulletTextTester key={entry.id} id={entry.id} text={entry.input} width={width} />
                })}
            </>, container);

        for (let entry of bullets){
            expect(screen.getByTestId(entry.id)).toHaveTextContent(entry.answer, {normalizeWhitespace:false});
        }
        
    });

    it('correctly renders pre-optimized and/or perfect bullets (verified to fit in adobe pdf)', ()=>{
        const optimized = (
`- Led 42 mbrs/3 AFSCs thru JQS update; certified mbrs/trainers on 133 rqmts--propelled nascent flight trng to wing std
- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
- aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
- Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint oc
- amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad mi
- minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure d
- dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidata
- non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur
- adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
- nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
- in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
- aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
- Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint oc
- occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit
- amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad mi
- minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure d
- dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidata
- non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur
- nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
- in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in`);

        optimized.split('\n').forEach((line, i)=>{
            render(< RenderBulletTextTester key={i} id={i}  text={line} width={width} />, container);
            ////expect(screen.getByTestId(i+'').textContent.split('\n').length).toEqual(1);
            expect(screen.getByTestId(i+'')).toHaveTextContent(line, {normalizeWhitespace:false});
        })
    })
})


describe('checking AF707 bullets', () => {
    const width = 201.041 * DPMM;

    it('correctly renders pre-optimized and/or perfect bullets (verified to fit in adobe pdf)', ()=>{
        const optimized = (
`- Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna
- aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat
- Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint oc
- occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit
- amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad mi
- minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure d
- dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidata
- non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur
- adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
- nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
- in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in`);

        optimized.split('\n').forEach((line, i)=>{
            render(< RenderBulletTextTester key={i} id={i}  text={line} width={width} />, container);
            ////expect(screen.getByTestId(i+'').textContent.split('\n').length).toEqual(1);
            expect(screen.getByTestId(i+'')).toHaveTextContent(line, {normalizeWhitespace:false});
        })
    })
})