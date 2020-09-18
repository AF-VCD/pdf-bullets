import React from 'react';
import ReactDOM from 'react-dom';

import BulletApp from "./components/main.js"

import "./styles/index.scss"
import 'handsontable/dist/handsontable.full.css'

import * as serviceWorker from './serviceWorker';

const initialText = '- This is a custom built bullet writing tool; abbreviations will be replaced according to table in the abbreviations tab--you will see output on the right\n\
- This tool can optimize spacing; output will be red if the optimizer could not fix spacing with 2004 or 2006 Unicode spaces\n\
- Click the thesaurus button to show one; select a word in this or the output box to view synonyms--words in parentheses are abbreviations that are configured';

const tableData = [{
  enabled: true,
  value: 'abbreviations',
  abbr: 'abbrs',
}, {
  enabled: true,
  value: 'table',
  abbr: 'tbl',
}, {
  enabled: true,
  value: 'optimize',
  abbr: 'optim',
}, {
  enabled: true,
  value: 'with ',
  abbr: 'w/',
}, {
  enabled: true,
  value: 'parentheses',
  abbr: 'parens',
},
];

String.prototype.hashCode = function () {
  let hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const tableSettings = {
  columns: [{
    data: 'enabled',
    type: 'checkbox',
    disableVisualSelection: true,
    width: 20
  }, {
    data: 'value',
    type: 'text'
  }, {
    data: 'abbr',
    type: 'text'
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

let settings;
try {

  if (localStorage.getItem('bullet-settings')) {
    settings = JSON.parse(localStorage.getItem("bullet-settings"));


  }
} catch (err) {
  if (err.name === 'SecurityError') {
    console.log('Was not able to get localstorage bullets due to use of file interface and browser privacy settings');
  } else {
    throw err;
  }
}

ReactDOM.render(
  <>
    <div className="section" id="stuff" >
      <BulletApp savedSettings={settings} tableSettings={tableSettings} abbrData={tableData} initialText={initialText} initialWidth={"202.321mm"} />
    </div>
    <div className="container" id="footer">
      <div>If you have feedback, submit
          an <a href='https://github.com/EA-Pods-Team/pdf-bullets/issues'>issue</a>
          or a <a href="https://github.com/EA-Pods-Team/pdf-bullets/pulls">pull request</a>
      </div>
      <div>This site utilizes PDF.JS (pdf import), HandsOnTable (spreadsheet), the DataMuse API (thesaurus), and Bulma (CSS).</div>
      <div>Maintained by Christopher Kodama </div>
    </div>
  </>
, document.getElementById('root'));

/*

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


*/

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
