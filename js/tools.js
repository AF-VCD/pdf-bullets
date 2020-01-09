//PDF import
class ImportTools extends React.PureComponent{
    constructor(props){
        super(props);
        this.fileInputRef = React.createRef();
        this.state={
            type:'none'
        }
    }

    importFile = (e) => {
        if(!this.fileInputRef.current.value){
            clog('no file picked');
            return;
        }else{
            let callback = (file)=>{clog(file)};
            if(this.state.type == 'PDF'){
                callback = this.getDataFromPDF;
            }else if(this.state.type == 'JSON'){
                callback = this.getDataFromJSON;
            }
            //return Promise.resolve(this.fileInputRef.current.files[0]).then(callback).then(() => {
            //    this.fileInputRef.current.value = ''});
            callback(this.fileInputRef.current.files[0]);
            this.fileInputRef.current.value = '';
        }
    }
    inputClick = (importType) => {
        return () => {
            this.setState({
                type: importType,
            });
            this.fileInputRef.current.click();
        };
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
    getDataFromJSON = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            clog(e.target.result, checkJSON)
            
            const data = JSON.parse(e.target.result);
            
            this.props.onJSONImport(BulletApp.ParseSettings(data));
        };
        reader.readAsText(file)
    }
    render(){
        return( 
            <div className='toolbox'>
                <input type="file" onChange={this.importFile} style={{display:"none"}} ref={this.fileInputRef}></input>
                <button onClick={this.inputClick('PDF')}>Import (PDF)</button>
                <button onClick={this.inputClick('JSON')}>Import (JSON)</button>
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
        this.exportRef = React.createRef();
    }
    onSave = ()=>{
        const settings = this.props.onSave();
        //JSON stringifying an array for future growth
        clog(settings, checkSave)
        const storedData = JSON.stringify([settings]);
        clog(storedData, checkSave)
        try{
            localStorage.setItem('bullet-settings',storedData);
            console.log("saved settings/data to local storage with character length " + storedData.length);
        }catch(err){
            if(err.name == 'SecurityError'){
                alert("Sorry, saving to cookies does not work using the file:// interface and/or your browser's privacy settings")
            }else{
                throw err;
            }
        }
    }
    onExport = ()=>{
        const settings = this.props.onSave();
        //JSON stringifying an array for future growth
        clog(settings, checkSave)
        const storedData = JSON.stringify([settings]);
        clog(storedData, checkSave)

        const dataURI = 'data:application/JSON;charset=utf-8,'+ encodeURIComponent(storedData);
        this.exportRef.current.href=dataURI;
        this.exportRef.current.click();
        clog(dataURI, checkSave)
        console.log("exported settings/data to local storage with character length " + storedData.length);
        
    }
    render(){
        return (
            <div className='toolbox'>
                <button onClick={this.onSave}>Save</button>
                <button onClick={this.onExport}>Save JSON</button>
                <a style={{display:"none"}} download='settings.json' ref={this.exportRef}></a>
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
                <SaveTools onSave={this.props.onSave}/>
                <ImportTools onJSONImport={this.props.onJSONImport} onTextUpdate={this.props.onTextUpdate} onWidthUpdate={this.props.onWidthUpdate}/>
                <OutputTools 
                    enableOptim={this.props.enableOptim} onOptimChange={this.props.onOptimChange} 
                    width={this.props.width} onWidthChange={this.props.onWidthChange}
                    onWidthUpdate={this.props.onWidthUpdate}/>
                <InputTools onTextNorm={this.props.onTextNorm}/>
                
            </div>
        );
    }
}
