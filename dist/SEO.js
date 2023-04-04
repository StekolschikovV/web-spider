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
exports.getSEO = void 0;
const axios_1 = __importDefault(require("axios"));
const explorer_1 = __importDefault(require("./explorer"));
const data_collector_1 = __importDefault(require("./data-collector"));
const getSEO = (url) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("getSEO", url);
    let result = [];
    let title, description, keywords, content, metrics, loadTime, inGoogleSearch;
    let tagsCount = {
        h1: 0,
        h2: 0,
        h3: 0,
        h4: 0,
        p: 0
    };
    let imgs = [];
    let page = yield explorer_1.default.getPage(url);
    content = yield (page === null || page === void 0 ? void 0 : page.content());
    title = yield (page === null || page === void 0 ? void 0 : page.title());
    metrics = yield (page === null || page === void 0 ? void 0 : page.metrics());
    loadTime = metrics === null || metrics === void 0 ? void 0 : metrics.TaskDuration;
    keywords = yield data_collector_1.default.getKeywords(page);
    description = yield data_collector_1.default.getDescription(page);
    tagsCount = yield data_collector_1.default.getTagsCount(page);
    const _imgs = yield data_collector_1.default.getImages(page);
    for (let i in _imgs) {
        let img = _imgs[i];
        let _url = new URL(url);
        img.src = (img === null || img === void 0 ? void 0 : img.src.startsWith('/')) ? (_url === null || _url === void 0 ? void 0 : _url.origin) + (img === null || img === void 0 ? void 0 : img.src) : img === null || img === void 0 ? void 0 : img.src;
        const size = yield axios_1.default
            .get(img === null || img === void 0 ? void 0 : img.src)
            .then(e => {
            if ((e === null || e === void 0 ? void 0 : e.headers['content-type']) === "image/svg+xml") {
                return e.data.length;
            }
            else {
                return (e === null || e === void 0 ? void 0 : e.headers['content-length']) || 0;
            }
        })
            .catch(e => {
            return 0;
        });
        img.size = size;
        imgs.push(img);
    }
    page = yield explorer_1.default.getPage(url);
    inGoogleSearch = yield data_collector_1.default.getInGoogleSearch(page);
    if (!title || (title === null || title === void 0 ? void 0 : title.length) < 5) {
        result.push({
            type: "error",
            text: "Title not specified."
        });
    }
    else if ((title === null || title === void 0 ? void 0 : title.length) < 30 || (title === null || title === void 0 ? void 0 : title.length) > 79) {
        result.push({
            type: "warning",
            text: `The length of the title meta tag should be between 70-80 characters. Current length: ${title === null || title === void 0 ? void 0 : title.length}.`
        });
    }
    imgs.forEach(img => {
        var _a, _b;
        if (((_a = img === null || img === void 0 ? void 0 : img.src) === null || _a === void 0 ? void 0 : _a.length) > 0 && ((_b = img === null || img === void 0 ? void 0 : img.alt) === null || _b === void 0 ? void 0 : _b.length) < 3) {
            result.push({
                type: "warning",
                text: `Image(${img === null || img === void 0 ? void 0 : img.src}) must contain the alt attribute.`
            });
        }
        if ((img === null || img === void 0 ? void 0 : img.src) && (img === null || img === void 0 ? void 0 : img.size) < 3) {
            result.push({
                type: "error",
                text: `Error getting image(${img === null || img === void 0 ? void 0 : img.src}).`
            });
        }
    });
    if ((tagsCount === null || tagsCount === void 0 ? void 0 : tagsCount.h1) !== 1) {
        result.push({
            type: "error",
            text: `The page must contain one h1 tag. Current count: ${tagsCount === null || tagsCount === void 0 ? void 0 : tagsCount.h1}.`
        });
    }
    if ((tagsCount === null || tagsCount === void 0 ? void 0 : tagsCount.p) === 0) {
        result.push({
            type: "warning",
            text: `Page content must be in the p tag.`
        });
    }
    if ((description === null || description === void 0 ? void 0 : description.length) > 160 || (description === null || description === void 0 ? void 0 : description.length) < 26) {
        result.push({
            type: "warning",
            text: `The description tag should be 25-160 characters long. Current length: ${description === null || description === void 0 ? void 0 : description.length}.`
        });
    }
    if ((keywords === null || keywords === void 0 ? void 0 : keywords.length) > 149 || (keywords === null || keywords === void 0 ? void 0 : keywords.length) < 20) {
        result.push({
            type: "warning",
            text: `The length of keywords should be in the range of 20-150 characters. Current length: ${keywords === null || keywords === void 0 ? void 0 : keywords.length}.`
        });
    }
    if (inGoogleSearch === 0) {
        result.push({
            type: "error",
            text: `The page is not indexed by the Google search engine.`
        });
    }
    if (loadTime > 3) {
        result.push({
            type: "error",
            text: `The page takes a critically long time to load. Loading time: ${loadTime} seconds.`
        });
    }
    const contentBitesLength = (_a = Buffer.from(content)) === null || _a === void 0 ? void 0 : _a.length;
    const contentKiloBytesLength = contentBitesLength / 1000;
    if (125 < contentKiloBytesLength) {
        result.push({
            type: "warning",
            text: `The html size exceeds the allowed size of 125kb. Current size: ${contentKiloBytesLength}kb.`
        });
    }
    if (title) {
        console.log("getSEO return", 1);
        return {
            status: 1,
            data: result,
            test: {
                title,
                description,
                keywords,
            }
        };
    }
    else {
        console.log("getSEO return", 3);
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
exports.getSEO = getSEO;
