"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const child_process_1 = require("child_process");
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const SEO_1 = require("./SEO");
const previewer_1 = require("./previewer");
const tor_1 = __importDefault(require("./tor"));
const queue = require('express-queue');
// Using queue middleware
const urlParser = require('url');
const app = (0, express_1.default)();
const port = process.env.PORT || 1340;
app.use(queue({ activeLimit: 1, queuedLimit: -1 }));
app.get('/healthcheck', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let torResponse, seoResponse;
    try {
        const url = "https://www.mozilla.org/";
        const torUrl = "http://underdiriled6lvdfgiw4e5urfofuslnz7ewictzf76h4qb73fxbsxad.onion/";
        torResponse = yield tor_1.default.get(torUrl);
        seoResponse = yield (0, SEO_1.getSEO)(url);
    }
    catch (e) { }
    if ((torResponse === null || torResponse === void 0 ? void 0 : torResponse.status) === 1 && (seoResponse === null || seoResponse === void 0 ? void 0 : seoResponse.status) === 1) {
        console.log("healthcheck", 1);
        res.status(200).json({
            status: 1
        });
    }
    else {
        process.exit(1);
        console.log("healthcheck", 0);
        res.status(500).json({
            status: 0
        });
    }
}));
app.get('/previewer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const unresponsiveText = "This page is currently unresponsive. Try again later or check the url. <button onclick='window.location.reload()' style='cursor: pointer; background: transparent; color: white; border: 0; display: block; margin: auto; font-size: 24px; padding: 40px;'>Reload now</button><button onclick='history.back()' style='background: transparent; color: white; border: 0; display: block; margin: auto; font-size: 16px; padding: 0px;cursor: pointer;'>Go Back</button>";
    const { url } = urlParser.parse(req.url, true).query;
    if (url && typeof url === "string") {
        const pageFileName = (0, previewer_1.urlToFileName)(url);
        const pageHtmlFilePath = path_1.default.join(__dirname, 'cache', `${pageFileName}.html`);
        const pageMhtmlFilePath = path_1.default.join(__dirname, 'cache', `${pageFileName}.mhtml`);
        if (!fs.existsSync(path_1.default.join(__dirname, 'cache'))) {
            fs.mkdirSync(path_1.default.join(__dirname, 'cache'));
        }
        if (fs.existsSync(pageHtmlFilePath)) {
            const html = yield fs.readFileSync(pageHtmlFilePath, 'utf8');
            res.send((0, previewer_1.fixUtl)((0, previewer_1.addLoader)(html)));
        }
        else {
            const pageMhtml = yield (0, previewer_1.getTopPreviewer)(url);
            if (pageMhtml) {
                yield fs.writeFileSync(pageMhtmlFilePath, pageMhtml);
                let mhtml2htmlError = false;
                try {
                    let result = (0, child_process_1.execSync)(`mhtml2html ${pageFileName}.mhtml ${pageFileName}.html`, { cwd: path_1.default.join('./dist/', 'cache') });
                    fs.unlink(pageMhtmlFilePath, () => {
                    });
                }
                catch (e) {
                    mhtml2htmlError = true;
                }
                if (mhtml2htmlError) {
                    res.status(500).send((0, previewer_1.errorHtml)("Error in page decoding. Try again later or check the url."));
                }
                else {
                    try {
                        const html = yield fs.readFileSync(pageHtmlFilePath, 'utf8');
                        res.status(200).send((0, previewer_1.fixUtl)((0, previewer_1.addLoader)(html)));
                    }
                    catch (e) {
                        res.status(500).send((0, previewer_1.errorHtml)(unresponsiveText));
                    }
                }
            }
            else {
                res.status(500).send((0, previewer_1.errorHtml)(unresponsiveText));
            }
        }
    }
}));
app.get('/tor', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = urlParser.parse(req.url, true).query;
    if (url) {
        const response = yield tor_1.default.get(url);
        res.status(200).json(response);
    }
    else {
        res.json({
            status: 0,
            error: "not url"
        });
    }
}));
app.get('/seo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = urlParser.parse(req.url, true).query;
    if (url) {
        const seo = yield (0, SEO_1.getSEO)(url);
        res.status(200).json(seo);
    }
    else {
        res.status(200).json({
            status: 0
        });
    }
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
