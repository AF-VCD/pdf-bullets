function initTables(){
    var dataObject = [
    {
        enabled: 1,
        abbr: 'ACC',
        value: 'Air Combat Command',
        occurrences: 0,
    },
    {
        enabled: 1,
        abbr: 'EW',
        value: 'Electronic Warfare',
        occurrences: 0,
    }
    ];

    var hotElement = document.querySelector('#hoTable');
    var hotElementContainer = hotElement.parentNode;
    var hotSettings = {
        data: dataObject,
        columns: [
            {
            data: 'enabled',
            type: 'text',
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
        manualRowMove: true,
        manualColumnMove: true,
        columnSorting: {
            indicator: true
        },
        autoColumnSize: {
            samplingRatio: 23
        },
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
    var hot = new Handsontable(hotElement, hotSettings);
    return hot;
    //hot.getDataAtProp('value')
    //var searchTerm = 'Air Combat Command'
    //var search = hot.getPlugin('search');
    //console.log(search.query(searchTerm))
}