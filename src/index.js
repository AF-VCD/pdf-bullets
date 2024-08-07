import React from "react";
import ReactDOM from "react-dom";

//import {Bullet, BulletComparator, Skeleton} from "./components/bullets.js"
import BulletApp from "./BulletApp.js";

import "./styles/index.scss";
import "handsontable/dist/handsontable.full.css";

import * as serviceWorker from "./serviceWorker";
import WebFont from "webfontloader";

WebFont.load({
  custom: {
    families: ["AdobeTimes"],
  },
});

ReactDOM.render(
  <>
    <div className="section" id="stuff">
      <BulletApp />
    </div>
    <div className="container" id="footer">
      <div>
        If you have feedback, submit an 
        <a href="https://github.com/AF-VCD/pdf-bullets/issues"> issue </a>
        or a 
        <a href="https://github.com/AF-VCD/pdf-bullets/pulls"> pull request</a>
      </div>
      <div>
        This site utilizes PDF.JS (pdf import), react-table (spreadsheet),
        draft-js (editor), the DataMuse API (thesaurus), and Bulma (CSS).
      </div>
      <div>Maintained by Christopher Kodama </div>
    </div>
  </>,
  document.getElementById("root")
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
