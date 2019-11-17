function initTables(){
    var abbrData = [
    {
        enabled: true,
        abbr: 'eq',
        value: 'equipment',
        occurrences: 0,
    },
    {
        enabled: true,
        abbr: 'tst',
        value: 'test',
        occurrences: 0,
    }
    ];

    var abbrTableEl = document.querySelector('#abbrTable');
    var AbbrTableElParent = abbrTableEl.parentNode;
    var abbrTableSettings = {
        data: abbrData,
        columns: [
            {
            data: 'enabled',
            type: 'checkbox',
            disableVisualSelection: true,
            },

            {
            data: 'value',
            type: 'text'
            },
            {
            data: 'abbr',
            type: 'text'
            },
            {
            data: 'occurrences',
            type: 'numeric',
            numericFormat: {
                pattern: '0'
                },
            editor:false
            },
        ],
        stretchH: 'all',
        width: 500,
        autoWrapRow: true,
        height: 487,
        maxRows: 22,
        manualRowResize: true,
        manualColumnResize: true,
        rowHeaders: true,
        colHeaders: [
            'E',
            'V',
            'A',
            'O',
        ],
        enterBeginsEditing:false,
        manualRowMove: true,
        manualColumnMove: true,
        columnSorting: {
            indicator: true
        },
        autoColumnSize: {
            samplingRatio: 23
        },
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
    for (var i = 0; i < window.abbrTable.countRows();i++){
        if(abbrTable.getDataAtRowProp(i,'enabled')){
            var fullWord = abbrTable.getDataAtRowProp(i,'value');
            var abbr = abbrTable.getDataAtRowProp(i,'abbr');
            sentence = sentence.replace(
                new RegExp("(^|[^\w])" + fullWord + "([^\w]|$)",'g'),'$1' + abbr + '$2');
        }
    }
    return sentence;
}