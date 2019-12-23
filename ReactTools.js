//PDF import
class PDFTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        return( 
            <div>
                <input type="file" style={{display:"none"}}></input>
                <button>Import from PDF</button>
            </div>
        );
    }
}
// form width, space optimization, select text
class OutputTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        return( 
            <div>
                <label>Enter form width or click preset: </label>
                <input type='number' min="100" max="500" step=".001"></input>
                <button>AWD</button>
                <button>EPR</button>
                <button>OPR</button>
            </div>
        );
    }
}
// normalize spaces
class InputTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        return <div />;
    }
}
// saving settings
class SaveTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        return <div />;
    }
}
class DocumentTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div>
                <PDFTools />
                <OutputTools />
                <InputTools />
                <SaveTools />
            </div>
        );
    }
}
