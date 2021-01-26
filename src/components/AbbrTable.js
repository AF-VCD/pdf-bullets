import React from 'react';
import { HotTable } from '@handsontable/react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';

const testTagRenderer = function(instance, td, row, col, prop, value, cellProperties){
    
    if(cellProperties.prop === 'enabled'){
        Handsontable.renderers.CheckboxRenderer.apply(this,arguments);
    } else{
        Handsontable.renderers.TextRenderer.apply(this, arguments);
    }
    //console.log(row)
    //console.log({instance, cellProperties})
    td.setAttribute("data-testid", cellProperties.prop + '-' + row);
    
}

const tableSettings = {
    columns: [{
      data: 'enabled',
      type: 'checkbox',
      disableVisualSelection: true,
      width: 20,
      renderer: testTagRenderer,
    }, {
      data: 'value',
      type: 'text',
      renderer: testTagRenderer,
    }, {
      data: 'abbr',
      type: 'text',
      renderer: testTagRenderer,
    },
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
    enterBeginsEditing: false,
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
      queryMethod: function (queryStr, value) {
        return queryStr.toString() === value.toString();
      },
      callback: function (instance, row, col, value, result) {
        const DEFAULT_CALLBACK = function (instance, row, col, data, testResult) {
          instance.getCellMeta(row, col).isSearchResult = testResult;
        };
  
        DEFAULT_CALLBACK.apply(this, arguments);
      },
    },
  };

function AbbrTable({data, setData}){
    const tableRef = React.useRef(null)
    
    const update = (payload, source)=>{    
        console.log({source, payload, tableRef: tableRef.current , data})

        if(source !== 'loadData' && tableRef.current !== null){
            const rawData = tableRef.current.hotInstance.getData();
            const newData = rawData.map((row)=>{ 
                return {
                    enabled: row[0],
                    value: row[1],
                    abbr: row[2]
                }
             });
            setData(newData)
        }
    }

    return (<HotTable {...tableSettings}
        data={data}
        ref={tableRef}
        afterChange={update}
    />)
}

export default AbbrTable;
