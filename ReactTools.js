//PDF import
class PDFTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        return( 
            <div className='toolbox'>
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
            <div className='toolbox'>
                <label>Enter form width or click preset: </label>
                <input type='number' min="100" max="500" step=".001"></input>
                <button>AWD</button>
                <button>EPR</button>
                <button>OPR</button>
                <input type="checkbox" 
                    checked={this.props.enableOptim} 
                    onChange={this.props.onOptimChange} id="enableOptim" /><label htmlFor='enableOptim'>space optimization</label>
            </div>
        );
    }
}
// normalize spaces
class InputTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    normalize = ()=>{
        clog(this.props.bulletComparator.state) ;
    }
    render(){
        return (
            <div className='toolbox'>
                <button onClick={this.normalize}>Renormalize Input Spacing</button>
            </div>
        );
    }
}
// saving settings
class SaveTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <div className='toolbox'>
                <button>Save Text + Settings</button>
            </div>
        );
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
                <OutputTools 
                    enableOptim={this.props.enableOptim} onOptimChange={this.props.onOptimChange}/>
                <InputTools />
                <SaveTools />
            </div>
        );
    }
}
