import widthMap from  "./12pt-times.json"
import {renderBulletText} from '../../src/components/bullets.js';
import React from 'react';
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
    React.useEffect(() => {
        
        //context.fillText(props.text, 50,50);
        setResults(renderBulletText(props.text, getWidth, props.width).text)
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

describe('checking bullets', () => {
    it('evaluates various bullets properly', ()=>{

        let bullets = [];
        const width = 202.321 * DPMM;
        

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
            id:'example1',
            input: 'Led 42 mbrs/3 AFSCs thru JQS update; certified mbrs/trainers on 133 rqmts--propelled nascent flight trng to wing std',
            answer: 'Led 42 mbrs/3 AFSCs thru JQS update; certified mbrs/trainers on 133 rqmts--propelled nascent flight trng to wing std'
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
            </>);

        for (let entry of bullets){
            expect(screen.getByTestId(entry.id)).toHaveTextContent(entry.answer, {normalizeWhitespace:false});
        }
        
    });
})
