//PDF import
class PDFTools extends React.PureComponent{
    constructor(props){
        super(props);
        this.fileInputRef = React.createRef();
    }

    importPDF = (e) => {
        if(!this.fileInputRef.current.value){
            clog('no file picked');
            return;
        }else{
            return Promise.resolve(this.fileInputRef.current.files[0]).then(this.getDataFromPDF);
        }
    }
    inputClick = () => {
        this.fileInputRef.current.click();;
    }
    getDataFromPDF = (file) => {
        const tasks = getBulletsFromPdf(file);
        //note: these promises are PDFJS promises, not ES promises

        //was not able to call this (this.props.onTextUpdate) inside the "then" scope, so I const'ed them out
        const textUpdater = this.props.onTextUpdate;
        const widthUpdater = this.props.onWidthUpdate;

        tasks.pullBullets.then(function(bulletsHTML){
                        
            // This is needed to convert the bullets HTML into normal text. It gets rid of things like &amp;
           const bullets = 
                new DOMParser().parseFromString(bulletsHTML,'text/html').documentElement.textContent;
            clog(bullets,checkPDF)
            
            textUpdater(bullets)();
            
        });

        tasks.getPageInfo.then(function(data){
            const newWidth = data.width;
            clog(newWidth,checkPDF);
            widthUpdater(data.width)();          
        });
    }
    render(){
        return( 
            <div className='toolbox'>
                <input type="file" onChange={this.importPDF} style={{display:"none"}} ref={this.fileInputRef}></input>
                <button onClick={this.inputClick}>Import from PDF</button>
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
                <label htmlFor="widthInput">Enter form width or click preset: </label>
                <input id="widthInput" type='number' min="100" max="500" step=".001" value={this.props.width.replace(/[a-zA-Z]/g,'')} onChange={this.props.onWidthChange}></input>
                <button onClick={this.props.onWidthUpdate("202.321mm")}>AWD</button>
                <button onClick={this.props.onWidthUpdate("202.321mm")}>EPR</button>
                <button onClick={this.props.onWidthUpdate("201.041mm")}>OPR</button> 
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

    render(){
        return (
            <div className='toolbox'>
                <button onClick={this.props.onTextNorm}>Renormalize Input Spacing</button>
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
                <PDFTools onTextUpdate={this.props.onTextUpdate} onWidthUpdate={this.props.onWidthUpdate}/>
                <OutputTools 
                    enableOptim={this.props.enableOptim} onOptimChange={this.props.onOptimChange} 
                    width={this.props.width} onWidthChange={this.props.onWidthChange}
                    onWidthUpdate={this.props.onWidthUpdate}/>
                <InputTools onTextNorm={this.props.onTextNorm}/>
                <SaveTools />
            </div>
        );
    }
}
