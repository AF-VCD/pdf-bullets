//PDF import
class ImportTools extends React.PureComponent{
    constructor(props){
        super(props);
        this.fileInputRef = React.createRef();
        this.state={
            type:'none',
            hovering:false,
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
            if(checkPDF) console.log(bullets) 
            textUpdater(bullets)();
        });

        tasks.getPageInfo.then(function(data){
            const newWidth = data.width;
            if(checkPDF) console.log(newWidth);
            widthUpdater(data.width)();          
        });
    }
    getDataFromJSON = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if( checkJSON) console.log(e.target.result)
            
            const data = JSON.parse(e.target.result);
            
            this.props.onJSONImport(BulletApp.ParseSettings(data));
        };
        reader.readAsText(file)
    }

    hoverOut = () => {
        this.setState({hovering: false});
    }
    toggleMenu = () => {
        const current = this.state.hovering;
        this.setState({hovering:!current});
    }
    render(){
        const menuState = this.state.hovering? "is-active": "";
        return( 
            <div className={"dropdown" + ' ' + menuState}>
                <input type="file" onChange={this.importFile} style={{display:"none"}} ref={this.fileInputRef}></input>
                <div className="dropdown-trigger">
                    <div className="buttons has-addons">
                        <button className="button" onClick={this.inputClick('PDF')}>Import</button>
                        <button className="button" onClick={this.toggleMenu}  aria-haspopup="true" aria-controls="import-menu" >
                            <span className="icon">
                                <i className="fas fa-angle-down" aria-hidden="true"></i>
                            </span> 
                        </button>
                    </div>
                </div>
                <div className="dropdown-menu" id="import-menu" role="menu" onMouseLeave={this.hoverOut}>
                    <div className="dropdown-content">
                        <a className="dropdown-item" onClick={this.inputClick('PDF')}>PDF</a>
                        <a className="dropdown-item" onClick={this.inputClick('JSON')}>JSON</a>
                    </div>
                </div>
            </div>
        );
    }
}
// form width, space optimization, select text
class OutputTools extends React.PureComponent{
    constructor(props){
        super(props);
        this.state = {

        }
    }
    render(){
        const widthAWD = '202.321mm';
        const widthEPR = '202.321mm';
        const widthOPR = '201.041mm';
        return( 
            <div className="field is-grouped">
                {/* if I want to group things together in a field, each subelement must have the control class name */}
                <div className="control field has-addons">
                    <div className="control has-icons-right">
                        <input className="input" id="widthInput" type='number' min="100" max="500" step=".001" value={this.props.width.replace(/[a-zA-Z]/g,'')} onChange={this.props.onWidthChange}></input>
                        <span className='icon is-right'>mm</span>
                    </div>
                    <div className="control buttons has-addons">
                        <a className={"button is-primary" + ' ' + (this.props.width==widthAWD?'':'is-outlined')}
                            onClick={this.props.onWidthUpdate(widthAWD)}>AWD</a>
                        <a className={"button is-success" + ' ' + (this.props.width==widthEPR?'':'is-outlined')}
                            onClick={this.props.onWidthUpdate(widthEPR)}>EPR</a>
                        <a className={"button is-link" + ' ' + (this.props.width==widthOPR?'':'is-outlined')}
                            onClick={this.props.onWidthUpdate(widthOPR)}>OPR</a> 
                    </div>                    

                </div>
                
                <a className={"control button is-dark" + (this.props.enableOptim?'':"is-outlined")}
                    onClick={this.props.onOptimChange} id="enableOptim">Auto-Space</a>        
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
            <button className="button" onClick={this.props.onTextNorm}>Renormalize Input Spacing</button>
        );
    }
}
// saving settings
class SaveTools extends React.PureComponent{
    constructor(props){
        super(props);
        this.exportRef = React.createRef();
        this.state = {hovering:false};
    }
    onSave = ()=>{
        const settings = this.props.onSave();
        //JSON stringifying an array for future growth
        if( checkSave) console.log(settings)
        const storedData = JSON.stringify([settings]);
        if( checkSave) console.log(storedData)
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
        if( checkSave) console.log(settings)
        const storedData = JSON.stringify([settings]);
        if( checkSave) console.log(storedData)

        const dataURI = 'data:application/JSON;charset=utf-8,'+ encodeURIComponent(storedData);
        this.exportRef.current.href=dataURI;
        this.exportRef.current.click();
        if( checkSave) console.log(dataURI)
        console.log("exported settings/data to local storage with character length " + storedData.length);
        
    }
    hoverOut = () => {
        this.setState({hovering: false});
    }
    toggleMenu = () => {
        const current = this.state.hovering;
        this.setState({hovering:!current});
    }
    render(){
        const menuState = this.state.hovering? "is-active": "";
        return (
            <div className={'dropdown' + ' ' + menuState}>
                <div className="dropdown-trigger">
                    <div className="buttons has-addons">
                        <button className="button" onClick={this.onSave}>Save </button>
                        <button className="button" aria-haspopup="true" aria-controls="save-menu" >
                            <span className="icon" onClick={this.toggleMenu} >
                                <i className="fas fa-angle-down" aria-hidden="true"></i>
                            </span> 
                        </button>
                    </div> 
                </div>
                <div className="dropdown-menu" id="save-menu" role="menu" onMouseLeave={this.hoverOut}>
                    <div className="dropdown-content">
                        <a className="dropdown-item" onClick={this.onSave}>Cookie</a>
                        <a className="dropdown-item" onClick={this.onExport}>JSON</a>
                    </div>
                </div>
                
                <a style={{display:"none"}} download='settings.json' ref={this.exportRef}></a>
            </div>
        );
    }
}
class Logo extends React.PureComponent{
    render() {
        return (
            <h1 className='title'><span className="logo">AF </span>
                <span className="logo">Bull</span>et 
                <span className="logo"> Sh</span>aping &amp; 
                <span className="logo"> i</span>teration 
                <span className="logo"> t</span>ool
            </h1>
            );
    }
}
class ThesaurusTools extends React.PureComponent{
    render(){
        return(
            <a className="button" onClick={this.props.onHide} aria-haspopup="true" aria-controls="thesaurus-menu" >
                <span>Thesaurus</span><span className="icon"  >
                    <i className="fas fa-angle-down" aria-hidden="true"></i>
                </span> 
            </a>
        );
    }
}
class DocumentTools extends React.PureComponent{
    constructor(props){
        super(props);
    }
    render(){
        return (
            <nav className="navbar" role="navigation" aria-label="main navigation">
                <div className="navbar-start">
                    <div className="navbar-item">
                        <SaveTools onSave={this.props.onSave}/>
                    </div>
                    <div className="navbar-item">
                        <ImportTools onJSONImport={this.props.onJSONImport} onTextUpdate={this.props.onTextUpdate} onWidthUpdate={this.props.onWidthUpdate}/>
                    </div>
                    <div className="navbar-item">
                        <OutputTools 
                            enableOptim={this.props.enableOptim} onOptimChange={this.props.onOptimChange} 
                            width={this.props.width} onWidthChange={this.props.onWidthChange}
                            onWidthUpdate={this.props.onWidthUpdate}/>
                    </div>
                    <div className="navbar-item">
                        <InputTools onTextNorm={this.props.onTextNorm}/>
                    </div>
                    <div className="navbar-item">
                        <ThesaurusTools onHide={this.props.onThesaurusHide}/>
                    </div>
                </div>
            </nav>
        );
    }
}
