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
Object.defineProperty(exports, "__esModule", { value: true });
class DataCollector {
    constructor() {
        this.getDescription = (page) => __awaiter(this, void 0, void 0, function* () {
            let description = "";
            try {
                description = yield (page === null || page === void 0 ? void 0 : page.$eval('meta[name="description"]', el => el === null || el === void 0 ? void 0 : el.content));
            }
            catch (e) {
            }
            return description;
        });
        this.getKeywords = (page) => __awaiter(this, void 0, void 0, function* () {
            let keywords = "";
            try {
                keywords = yield (page === null || page === void 0 ? void 0 : page.$eval('meta[name="keywords"]', el => el === null || el === void 0 ? void 0 : el.content));
            }
            catch (e) {
            }
            return keywords;
        });
        this.getTagsCount = (page) => __awaiter(this, void 0, void 0, function* () {
            let result;
            try {
                result = yield (page === null || page === void 0 ? void 0 : page.evaluate(() => {
                    var _a, _b, _c, _d, _e;
                    return {
                        h1: (_a = Array.from(document === null || document === void 0 ? void 0 : document.querySelectorAll('h1'))) === null || _a === void 0 ? void 0 : _a.length,
                        h2: (_b = Array.from(document === null || document === void 0 ? void 0 : document.querySelectorAll('h2'))) === null || _b === void 0 ? void 0 : _b.length,
                        h3: (_c = Array.from(document === null || document === void 0 ? void 0 : document.querySelectorAll('h3'))) === null || _c === void 0 ? void 0 : _c.length,
                        h4: (_d = Array.from(document === null || document === void 0 ? void 0 : document.querySelectorAll('h4'))) === null || _d === void 0 ? void 0 : _d.length,
                        p: (_e = Array.from(document === null || document === void 0 ? void 0 : document.querySelectorAll('p'))) === null || _e === void 0 ? void 0 : _e.length
                    };
                }));
            }
            catch (e) {
                result = {
                    h1: 0,
                    h2: 0,
                    h3: 0,
                    h4: 0,
                    p: 0
                };
            }
            return result;
        });
        this.getImages = (page) => __awaiter(this, void 0, void 0, function* () {
            let images = [];
            try {
                const _imgs = yield (page === null || page === void 0 ? void 0 : page.$$eval('img[src]', imgs => imgs === null || imgs === void 0 ? void 0 : imgs.map(img => {
                    return {
                        src: img === null || img === void 0 ? void 0 : img.getAttribute('src'),
                        alt: img === null || img === void 0 ? void 0 : img.getAttribute('alt'),
                        size: 0
                    };
                })));
            }
            catch (e) { }
            return images;
        });
        this.getInGoogleSearch = (page) => __awaiter(this, void 0, void 0, function* () {
            let result = 0;
            try {
                result = +(yield (page === null || page === void 0 ? void 0 : page.evaluate(() => {
                    var _a, _b;
                    return (_b = (_a = document === null || document === void 0 ? void 0 : document.querySelector("#result-stats")) === null || _a === void 0 ? void 0 : _a.innerHTML) === null || _b === void 0 ? void 0 : _b.split("<nobr>")[0].split(" ").at(-1);
                })));
            }
            catch (e) { }
            return result;
        });
    }
}
const dataCollector = new DataCollector();
exports.default = dataCollector;
