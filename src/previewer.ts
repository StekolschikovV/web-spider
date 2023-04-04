import explorer from "./explorer";
const TRY_X = 5

export async function getTopPreviewer(url: string) {
    console.log("getTopPreviewer:", url)
    let result, page


    page = await explorer.getTorPage(url)
    try {
        const cdp = await page.target().createCDPSession();
        const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
        result = data
    } catch (err) { }

    return result
}

export const urlToFileName = (url: string): string =>
    url.replaceAll(":", "🏈").replaceAll("/", "💘").replaceAll(".", "🎭").replaceAll("?", "🇧🇷")



export const fixUtl = (htmlText: string): string =>
    htmlText
        .replaceAll(`href="http`, `href="?pageUrl=http`)
        .replaceAll(`action="http`, `action="?pageUrl=http`)
        .replaceAll(`_blank`, "")
        .replaceAll(`<a `, "<a target='_self'")

const loaderHTML = `<div id="loader-wrapper" style="display: none"><div id="loader"></div></div>`
const loaderStartHTML = `<div id="loader-wrapper"><div id="loader"></div></div>`
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
`

const loaderJS = `
                    <script>
                        document.querySelectorAll("a").forEach(a => a.addEventListener("click", (e) => {
                            setTimeout(() =>{
                                document.querySelector("#loader-wrapper").style.display = "block"
                                document.querySelector("body").style.overflow = "hidden"
                            },500)}
                        ))
                    </script>
                `

export const addLoader = (htmlText: string) => {
    return htmlText
        .replaceAll(`</head>`, `${loaderCSS}</head>`)
        .replaceAll(`</body>`, `${loaderHTML}</body>`)
        .replaceAll(`</body>`, `${loaderJS}</body>`)
}

export const addStartLoader = (htmlText: string) => {
    return htmlText
        .replaceAll(`</head>`, `${loaderCSS}</head>`)
        .replaceAll(`</body>`, `${loaderStartHTML}</body>`)
}


export const errorHtml = (errorText: string) => {
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
`
}