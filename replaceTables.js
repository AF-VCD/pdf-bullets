function initTables(abbrData){
    if(!abbrData){
        var abbrData = [
        {
            enabled: true,
            abbr: 'eq',
            value: 'equipment',
            
        },
        {
            enabled: true,
            abbr: 'tst',
            value: 'test',
            
        }
        ];
    }
    
    var abbrTableEl = document.querySelector('#abbrTable');
    //var AbbrTableElParent = abbrTableEl.parentNode;
    var abbrTableSettings = {
        data: abbrData,
        columns: [
            {
            data: 'enabled',
            type: 'checkbox',
            disableVisualSelection: true,
            width:20
            },

            {
            data: 'value',
            type: 'text'
            },
            {
            data: 'abbr',
            type: 'text'
            },
            /*{
            data: 'occurrences',
            type: 'numeric',
            numericFormat: {
                pattern: '0'
                },
            editor:false
            },*/
        ],
        stretchH: 'all',
        width: 500,
        autoWrapRow: true,
        height: 500,
        maxRows: Infinity,
        manualRowResize: true,
        manualColumnResize: true,
        rowHeaders: true,
        colHeaders: [
            'Enabled',
            'Word',
            'Abbreviation',
            
        ],
        trimWhitespace: false,
        enterBeginsEditing:false,
        manualRowMove: true,
        manualColumnMove: true,
        columnSorting: {
            indicator: true
        },
        autoColumnSize: false,
        minRows: 15,
        contextMenu: true,
        licenseKey: 'non-commercial-and-evaluation',
        search: {
            queryMethod: function(queryStr,value){
                //console.log(queryStr);
                //console.log(value);
                return queryStr.toString() === value.toString();
            },
            callback: function(instance, row, col, value, result){
                const DEFAULT_CALLBACK = function(instance, row, col, data, testResult) {
                    instance.getCellMeta(row, col).isSearchResult = testResult;
                };

                DEFAULT_CALLBACK.apply(this, arguments);
            },
        },
    };
    var abbrTable = new Handsontable(abbrTableEl, abbrTableSettings);
    
    return abbrTable;
    
    //hot.getDataAtProp('value')
    //var searchTerm = 'Air Combat Command'
    //var search = hot.getPlugin('search');
    //console.log(search.query(searchTerm))
}
function replaceAbbrs(sentence){
    
    //console.log('sentence in replaceAbbrs: "' + sentence + '"')
    var newSentence = sentence.replace(window.abbrRegExp, 
        function(match,p1,p2,p3){
            //p2 = p2.replace(/ /g,'\\s')
            var abbr = window.abbrDict[p2];
            if(!abbr){
                abbr = '';
            }
            return p1 + abbr +  p3;
        }
    );
    //console.log('sentence in replaceAbbrs replaced: "' + newSentence + '"')
    return newSentence;
}
function updateAbbrDict(){
    window.abbrDict = {};
    window.abbrDictDisabled = {};
    for (var i = 0; i < window.abbrTable.countRows();i++){
        var fullWord = String(abbrTable.getDataAtRowProp(i,'value')).replace(/\s/g,' ');
        var abbr = abbrTable.getDataAtRowProp(i,'abbr');
        //console.log('abbr: ' + abbr)
        if(abbrTable.getDataAtRowProp(i,'enabled')){
            //console.log('word enabled')
            window.abbrDict[fullWord] = abbr;
        }else{
            //console.log('word disabled')
            window.abbrDictDisabled[fullWord] = abbr;
        }
    }
    window.abbrRegExp = new RegExp("(\\b)("+Object.keys(window.abbrDict).join("|")+")(\\b|$|\\$)",'g');
} 

