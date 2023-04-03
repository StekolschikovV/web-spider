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
const child_process_1 = require("child_process");
const puppeteer_1 = __importDefault(require("puppeteer"));
const axios_1 = __importDefault(require("axios"));
let browser, browserPID, loadError;
const getSEO = (url) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log(url);
    loadError = false;
    let result = [];
    let title, description, keywords, content, metrics, loadTime, inGoogleSearch;
    let tagsCount = {};
    let imgs = [];
    console.log("--------", 1);
    try {
        browser = yield puppeteer_1.default.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox',],
            headless: true,
            executablePath: '/usr/bin/google-chrome',
        });
        browserPID = browser.process().pid;
        const [page] = yield browser.pages();
        yield page.setViewport({ width: 1080, height: 1024 });
        try {
            yield page.goto(url, {
                waitUntil: 'networkidle0',
            });
        }
        catch (err) {
            console.log(err);
            loadError = true;
        }
        if (!loadError) {
            // const endTime = new Date().getTime();
            // loadTime = (endTime - startTime) / 1000
            content = yield page.content();
            console.log("--------", 2);
            // try {
            //     meta = await page.evaluate(() => Array.from(document.querySelectorAll('meta'), (e) => {
            //         return JSON.stringify(e?.content)
            //     }))
            // } catch (e) {
            // }
            try {
                title = yield (page === null || page === void 0 ? void 0 : page.title());
            }
            catch (e) {
                console.log(e);
            }
            try {
                description = yield (page === null || page === void 0 ? void 0 : page.$eval('meta[name="description"]', el => el === null || el === void 0 ? void 0 : el.content));
            }
            catch (e) {
            }
            console.log("--------", 3);
            try {
                keywords = yield (page === null || page === void 0 ? void 0 : page.$eval('meta[name="keywords"]', el => el === null || el === void 0 ? void 0 : el.content));
            }
            catch (e) {
                console.log(e);
            }
            try {
                metrics = yield page.metrics();
                loadTime = metrics === null || metrics === void 0 ? void 0 : metrics.TaskDuration;
            }
            catch (e) {
                console.log(e);
            }
            try {
                tagsCount = yield (page === null || page === void 0 ? void 0 : page.evaluate(() => {
                    return {
                        h1: Array.from(document.querySelectorAll('h1')).length,
                        h2: Array.from(document.querySelectorAll('h2')).length,
                        h3: Array.from(document.querySelectorAll('h3')).length,
                        h4: Array.from(document.querySelectorAll('h4')).length,
                        p: Array.from(document.querySelectorAll('p')).length
                    };
                }));
            }
            catch (e) {
                console.log(e);
            }
            try {
                const _imgs = yield page.$$eval('img[src]', imgs => imgs.map(img => {
                    return {
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt')
                    };
                }));
                for (let i in _imgs) {
                    let img = _imgs[i];
                    let _url = new URL(url);
                    img.src = (img === null || img === void 0 ? void 0 : img.src.startsWith('/')) ? _url.origin + (img === null || img === void 0 ? void 0 : img.src) : img === null || img === void 0 ? void 0 : img.src;
                    const size = yield axios_1.default.get(img === null || img === void 0 ? void 0 : img.src)
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
            }
            catch (e) {
                console.log(e);
            }
            console.log("--------", 4);
            try {
                yield page.goto(`https://www.google.com/search?q=site%3A${url}`, {
                    waitUntil: 'networkidle0',
                });
                inGoogleSearch = yield page.evaluate(() => {
                    return document.querySelector("#result-stats").innerHTML.split("<nobr>")[0].split(" ").at(-1);
                });
            }
            catch (e) {
                console.log("!!!!!", e);
            }
            yield (page === null || page === void 0 ? void 0 : page.close());
        }
    }
    catch (err) {
        console.error(err);
    }
    finally {
        yield (browser === null || browser === void 0 ? void 0 : browser.close());
        setTimeout(function (pid) {
            console.log("!!!pid!!!", pid);
            (0, child_process_1.exec)('kill -KILL ' + pid, (error, stdout, stderr) => {
            });
        }, 1000, browserPID);
    }
    if (!loadError) {
        try {
            // -------------------------------- rules --------------------------------
            // --- title ---
            // Длина метатега title (тайтл) – должна быть в пределах 70-80 знаков или 10-12 слов, сформированных в связную фразу с использованием ключевых фраз.
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
            console.log("--------", 5);
            // --- img ---
            // Картинки должны содержать атрибут alt TODO: !!!
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
            // --- tag ---
            // Один главный текстовый заголовок страницы — h1. Желательно соблюдение порядка использования заголовков (сначала h1, далее h2 и далее h3).
            if ((tagsCount === null || tagsCount === void 0 ? void 0 : tagsCount.h1) !== 1) {
                result.push({
                    type: "error",
                    text: `The page must contain one h1 tag. Current count: ${tagsCount.h1}.`
                });
            }
            // if (tagsCount.h2 === 0) {
            //   result.push({
            //     type: "warning",
            //     text: `The page must contain at least one h2 tag.`
            //   })
            // }
            // if (tagsCount.h3 === 0) {
            //   result.push({
            //     type: "warning",
            //     text: `The page must contain at least one h3 tag.`
            //   })
            // }
            if (tagsCount.p === 0) {
                result.push({
                    type: "warning",
                    text: `Page content must be in the p tag.`
                });
            }
            // --- description ---
            //  Измените длину описания в теге <meta description> в исходном коде страницы до 25-160 символов.
            if ((description === null || description === void 0 ? void 0 : description.length) > 160 || (description === null || description === void 0 ? void 0 : description.length) < 26) {
                result.push({
                    type: "warning",
                    text: `The description tag should be 25-160 characters long. Current length: ${description === null || description === void 0 ? void 0 : description.length}.`
                });
            }
            console.log("--------", 6);
            // --- keywords ---
            // 150 знаков
            if ((keywords === null || keywords === void 0 ? void 0 : keywords.length) > 149 || (keywords === null || keywords === void 0 ? void 0 : keywords.length) < 20) {
                result.push({
                    type: "warning",
                    text: `The length of keywords should be in the range of 20-150 characters. Current length: ${keywords === null || keywords === void 0 ? void 0 : keywords.length}.`
                });
            }
            // --- inGoogleSearch ---
            if (inGoogleSearch === 0) {
                result.push({
                    type: "error",
                    text: `The page is not indexed by the Google search engine.`
                });
            }
            // --- loadTime ---
            // if (loadTime > 1 && loadTime < 3) {
            //   result.push({
            //     type: "warning",
            //     text: `The page takes a long time to load. Loading time: ${loadTime} seconds.`
            //   })
            // } else
            if (loadTime > 3) {
                result.push({
                    type: "error",
                    text: `The page takes a critically long time to load. Loading time: ${loadTime} seconds.`
                });
            }
            // --- kb size ---
            const contentBitesLength = (_a = Buffer.from(content)) === null || _a === void 0 ? void 0 : _a.length;
            const contentKiloBytesLength = contentBitesLength / 1000;
            // if (contentKiloBytesLength > 60 && 125 > contentKiloBytesLength) {
            //   result.push({
            //     type: "warning",
            //     text: `The page has a large html size. Size: ${contentKiloBytesLength}kb.`
            //   })
            // } else
            if (125 < contentKiloBytesLength) {
                result.push({
                    type: "warning",
                    text: `The html size exceeds the allowed size of 125kb. Current size: ${contentKiloBytesLength}kb.`
                });
            }
            console.log("--------", 7);
        }
        catch (e) {
        }
        return {
            status: 1,
            data: result
        };
    }
    else {
        return {
            status: 1,
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
