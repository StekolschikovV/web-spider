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
const explorer_1 = __importDefault(require("./explorer"));
class Tor {
    get(url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("getTor", url);
            let response = {};
            let page;
            try {
                page = yield explorer_1.default.getTorPage(url);
                // screenshot
                const screenshotFileName = url.split('/')[2].replaceAll('.', '-') + ".png";
                yield (page === null || page === void 0 ? void 0 : page.screenshot({
                    path: `${process.env.TEMP_DIRECTORY}${screenshotFileName}`,
                    fullPage: false
                }));
                // link
                response.links = yield (page === null || page === void 0 ? void 0 : page.$$eval('a', links => links === null || links === void 0 ? void 0 : links.map(a => a.href)));
                // innerHtml
                response.innerHtml = yield (page === null || page === void 0 ? void 0 : page.content());
                // title
                response.title = yield (page === null || page === void 0 ? void 0 : page.title());
                // keywords
                response.description = (yield (page === null || page === void 0 ? void 0 : page.evaluate(() => {
                    var _a;
                    return ((_a = document === null || document === void 0 ? void 0 : document.querySelector('meta[name="description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute("content")) || "";
                })));
                // description
                response.description = (yield (page === null || page === void 0 ? void 0 : page.evaluate(() => {
                    var _a;
                    return ((_a = document.querySelector('meta[name="description"]')) === null || _a === void 0 ? void 0 : _a.getAttribute("content")) || "";
                })));
                // innerText
                response.innerText = yield (page === null || page === void 0 ? void 0 : page.$eval('*', (el) => el === null || el === void 0 ? void 0 : el.innerText));
                // screenshot
                response.screenshot = yield (page === null || page === void 0 ? void 0 : page.screenshot({
                    encoding: "base64",
                    quality: 100,
                    type: 'jpeg',
                }).then(function (data) {
                    let base64Encode = `data:image/png;base64,${data}`;
                    return base64Encode;
                }));
            }
            catch (e) {
                response.statusCode = 600;
            }
            finally {
                // page?.close()
            }
            if (response === null || response === void 0 ? void 0 : response.title) {
                console.log("getTor return", 1);
                return {
                    status: 1,
                    data: response,
                    test: {
                        title: response === null || response === void 0 ? void 0 : response.title,
                        description: response === null || response === void 0 ? void 0 : response.description,
                        keywords: response === null || response === void 0 ? void 0 : response.keywords,
                    }
                };
            }
            else {
                console.log("getTor return", 3);
                return {
                    status: 3,
                    data: [
                        {
                            type: "error",
                            text: `The page is not responding!`
                        }
                    ]
                };
            }
        });
    }
}
const tor = new Tor();
exports.default = tor;
