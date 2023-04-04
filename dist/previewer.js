"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHtml = exports.addStartLoader = exports.addLoader = exports.fixUtl = exports.urlToFileName = exports.getTopPreviewer = void 0;
const explorer_1 = __importDefault(require("./explorer"));
function getTopPreviewer(url) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("getTopPreviewer:", url);
        let result;
        let page = yield explorer_1.default.getTorPage(url);
        try {
            const cdp = yield page.target().createCDPSession();
            const { data } = yield cdp.send('Page.captureSnapshot', { format: 'mhtml' });
            result = data;
        }
        catch (err) { }
        return result;
    });
}
exports.getTopPreviewer = getTopPreviewer;
const urlToFileName = (url) => {
    var _a, _b, _c;
    return (_c = (_b = (_a = url === null || url === void 0 ? void 0 : url.replaceAll(":", "🏈")) === null || _a === void 0 ? void 0 : _a.replaceAll("/", "💘")) === null || _b === void 0 ? void 0 : _b.replaceAll(".", "🎭")) === null || _c === void 0 ? void 0 : _c.replaceAll("?", "🇧🇷");
};
exports.urlToFileName = urlToFileName;
const fixUtl = (htmlText) => {
    var _a, _b, _c;
    return (_c = (_b = (_a = htmlText === null || htmlText === void 0 ? void 0 : htmlText.replaceAll(`href="http`, `href="?url=http`)) === null || _a === void 0 ? void 0 : _a.replaceAll(`action="http`, `action="?url=http`)) === null || _b === void 0 ? void 0 : _b.replaceAll(`_blank`, "")) === null || _c === void 0 ? void 0 : _c.replaceAll(`<a `, "<a target='_self'");
};
exports.fixUtl = fixUtl;
const loaderHTML = `<div id="loader-wrapper" style="display: none"><div id="loader"></div></div>`;
const loaderStartHTML = `<div id="loader-wrapper"><div id="loader"></div></div>`;
const loaderCSS = `
    <style>
        ::-webkit-scrollbar {
          width: 10px;
        }
        /* Track */
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        /* Handle */
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        /* Handle on hover */
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        #loader-wrapper {
            position: fixed;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            background: #161515;
            z-index: 199;

        }
        #loader {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 200;
          width: 120px;
          height: 120px;
          margin: -76px 0 0 -76px;
          border: 16px solid #e0e0e0;
          border-radius: 50%;
          border-top: 16px solid #37CECC;
          -webkit-animation: spin 2s linear infinite;
          animation: spin 2s linear infinite;
        }
        @-webkit-keyframes spin {
          0% { -webkit-transform: rotate(0deg); }
          100% { -webkit-transform: rotate(360deg); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Add animation to "page content" */
        .animate-bottom {
          position: relative;
          -webkit-animation-name: animatebottom;
          -webkit-animation-duration: 1s;
          animation-name: animatebottom;
          animation-duration: 1s
        }
        @-webkit-keyframes animatebottom {
          from { bottom:-100px; opacity:0 }
          to { bottom:0px; opacity:1 }
        }
        @keyframes animatebottom {
          from{ bottom:-100px; opacity:0 }
          to{ bottom:0; opacity:1 }
        }
    </style>
`;
const loaderJS = `
                    <script>
                        document.querySelectorAll("a").forEach(a => a.addEventListener("click", (e) => {
                            setTimeout(() =>{
                                document.querySelector("#loader-wrapper").style.display = "block"
                                document.querySelector("body").style.overflow = "hidden"
                            },500)}
                        ))
                    </script>
                `;
const addLoader = (htmlText) => {
    return htmlText
        .replaceAll(`</head>`, `${loaderCSS}</head>`)
        .replaceAll(`</body>`, `${loaderHTML}</body>`)
        .replaceAll(`</body>`, `${loaderJS}</body>`);
};
exports.addLoader = addLoader;
const addStartLoader = (htmlText) => {
    return htmlText
        .replaceAll(`</head>`, `${loaderCSS}</head>`)
        .replaceAll(`</body>`, `${loaderStartHTML}</body>`);
};
exports.addStartLoader = addStartLoader;
const errorHtml = (errorText) => {
    return `
        <style>
            body {
                background: #161515;
                color: #e0e0e0;
                font-size: 20px;
                text-align: center;
                padding: 20px;
            }
            a {
                color: #37CECC;
            }
            h1 {
                text-align: center;
                display: block;
                font-size: 100px;
                line-height: 0;
            }
        </style>
        <div style='width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;     flex-direction: column;'>
            <h1>404</h1>
             <h4>
                ${errorText}
             </h4>
        </div>
`;
};
exports.errorHtml = errorHtml;
