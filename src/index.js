import React from 'react';
import ReactDOM from 'react-dom';


//import {Bullet, BulletComparator, Skeleton} from "./components/bullets.js"
import BulletApp from "./components/main.js"

import "./styles/index.scss"
import 'handsontable/dist/handsontable.full.css'

import * as serviceWorker from './serviceWorker';
import WebFont from 'webfontloader';


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



WebFont.load({
    custom: {
        families: ['AdobeTimes']
    }
});


// <BulletApp savedSettings={settings} tableSettings={tableSettings} abbrData={tableData} initialText={initialText} initialWidth={"202.321mm"} />

const initialText = settings && settings.text? settings.text : '- This is a custom built bullet writing tool; abbreviations will be replaced according to table in the abbreviations tab--you will see output on the right\n\
- This tool can optimize spacing; output will be red if the optimizer could not fix spacing with 2004 or 2006 Unicode spaces\n\
- Click the thesaurus button to show one; select a word in this or the output box to view synonyms--words in parentheses are abbreviations that are configured';
;
const initialWidth = settings && settings.width? settings.width : 202.321;
const initialAbbrData = settings && settings.abbrData ? settings.abbrData.map((row) => {
  return {
      enabled: row[0],
      value: row[1],
      abbr: row[2],
  }
}) : tableData;

ReactDOM.render(
  <>
    <div className="section" id="stuff" >
      <BulletApp initialAbbrData={initialAbbrData} initialText={initialText} initialWidth={initialWidth} />
    </div>
    <div className="container" id="footer">
      <div>If you have feedback, submit
          an <a href='https://github.com/AF-VCD/pdf-bullets/issues'>issue</a>
          or a <a href="https://github.com/AF-VCD/pdf-bullets/pulls">pull request</a>
      </div>
      <div>This site utilizes PDF.JS (pdf import), HandsOnTable (spreadsheet), the DataMuse API (thesaurus), and Bulma (CSS).</div>
      <div>This site has basic analytics to track the total number of visits to the page. See <a href="https://github.com/ckhordiasma/log-bullet-visitors">here</a> for details</div>
      <div>Maintained by Christopher Kodama </div>
    </div>
  </>
, document.getElementById('root'));

incrementVisitors();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

function incrementVisitors() {
  // code for incrementing visitor count    
  const xh = new XMLHttpRequest();
  xh.onreadystatechange = () => {  
    if(xh.readyState === XMLHttpRequest.DONE) {
      var status = xh.status;

      // Not sure what status codes are acceptable.. using MDN successful responses and redirects range as a guide
      if ((status >= 200 && status < 400)) {
          // The request has been completed successfully
          const count = JSON.parse(xh.response).Count;
          console.log("The bullets site(s) have been visited " + count + " times.");

      } else {
        console.log("Visitor count increment: task failed successfully");
      }
    }
  }
  xh.open("POST", "https://g5z50elklh.execute-api.us-east-2.amazonaws.com/default/LogVisitors",true); 
  xh.send();
}