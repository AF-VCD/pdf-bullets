import React from 'react';
import ReactDOM from 'react-dom';


//import {Bullet, BulletComparator, Skeleton} from "./components/bullets.js"
import BulletApp from "./components/bulletapp.js"

import "./styles/index.scss"
import 'handsontable/dist/handsontable.full.css'

import * as serviceWorker from './serviceWorker';
import WebFont from 'webfontloader';



WebFont.load({
  custom: {
    families: ['AdobeTimes']
  }
});




ReactDOM.render(
  <>
    <div className="section" id="stuff" >
      <BulletApp  />
    </div>
    <div className="container" id="footer">
      <div>If you have feedback, submit
          an <a href='https://github.com/AF-VCD/pdf-bullets/issues'>issue</a>
          or a <a href="https://github.com/AF-VCD/pdf-bullets/pulls">pull request</a>
      </div>
      <div>This site utilizes PDF.JS (pdf import), react-table (spreadsheet), draft-js (editor), the DataMuse API (thesaurus), and Bulma (CSS).</div>
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
    if (xh.readyState === XMLHttpRequest.DONE) {
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
  xh.open("POST", "https://g5z50elklh.execute-api.us-east-2.amazonaws.com/default/LogVisitors", true);
  xh.send();
}