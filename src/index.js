import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
//import {Bullet, BulletComparator, Skeleton} from "./components/bullets.js"
import TopBulletApp from "./highlightStateHolder.js";

import "./styles/index.scss"
import 'handsontable/dist/handsontable.full.css'

import * as serviceWorker from './serviceWorker';
import WebFont from 'webfontloader';

WebFont.load({
  custom: {
    families: ["AdobeTimes"],
  },
});
const container = document.getElementById("root")
const root = createRoot(container)
root.render(
  <>
    <div className="section" id="stuff" >
      <TopBulletApp  />
    </div>
    <div className="container" id="footer">
      <div className="is-size-6 mb-2">
        <a href="https://github.com/AF-VCD/pdf-bullets#exclamation-august-2024-update">ANNOUNCEMENT (August 2024)</a>
      </div>
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
      <div>Maintained by <a href="https://www.xoid.net">Christopher Kodama</a></div>
    </div>
  </>
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
