import {exec} from "child_process";
import puppeteer from "puppeteer";
import axios from "axios";

interface ISEO {
    type: "warning" | "error"
    text: string
}

let browser, browserPID, loadError;

export const getSEO = async (url) => {
    console.log(url)
    loadError = false;
    let result: ISEO[] = []
    let title, description, keywords, content, metrics, loadTime, inGoogleSearch
    let tagsCount: {
        h1?: number,
        h2?: number,
        h3?: number,
        h4?: number,
        p?: number
    } = {}
    let imgs: {
        src: string
        alt: string
        size: number
    }[] = []
    console.log("--------", 1)
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox',],
            headless: true,
            executablePath: '/usr/bin/google-chrome',
        });
        browserPID = browser.process().pid
        const [page] = await browser.pages();
        await page.setViewport({width: 1080, height: 1024});
        try {
            await page.goto(url, {
                waitUntil: 'networkidle0',

            });
        } catch (err) {
            console.log(err)
            loadError = true
        }
        if (!loadError) {
            // const endTime = new Date().getTime();
            // loadTime = (endTime - startTime) / 1000
            content = await page.content()
            console.log("--------", 2)
            // try {
            //     meta = await page.evaluate(() => Array.from(document.querySelectorAll('meta'), (e) => {
            //         return JSON.stringify(e?.content)
            //     }))
            // } catch (e) {
            // }
            try {
                title = await page?.title()
            } catch (e) {
                console.log(e)
            }
            try {
                description = await page?.$eval('meta[name="description"]', el => el?.content);
            } catch (e) {
            }
            console.log("--------", 3)
            try {
                keywords = await page?.$eval('meta[name="keywords"]', el => el?.content);
            } catch (e) {
                console.log(e)
            }
            try {
                metrics = await page.metrics();
                loadTime = metrics?.TaskDuration
            } catch (e) {
                console.log(e)
            }
            try {
                tagsCount = await page?.evaluate(() => {
                    return {
                        h1: Array.from(document.querySelectorAll('h1')).length,
                        h2: Array.from(document.querySelectorAll('h2')).length,
                        h3: Array.from(document.querySelectorAll('h3')).length,
                        h4: Array.from(document.querySelectorAll('h4')).length,
                        p: Array.from(document.querySelectorAll('p')).length
                    }
                })
            } catch (e) {
                console.log(e)
            }
            try {
                const _imgs = await page.$$eval('img[src]', imgs => imgs.map(img => {
                    return {
                        src: img.getAttribute('src'),
                        alt: img.getAttribute('alt')
                    }
                }))
                for (let i in _imgs) {
                    let img = _imgs[i];
                    let _url = new URL(url);
                    img.src = img?.src.startsWith('/') ? _url.origin + img?.src : img?.src
                    const size = await axios.get(img?.src)
                        .then(e => {
                            if (e?.headers['content-type'] === "image/svg+xml") {
                                return e.data.length
                            } else {
                                return e?.headers['content-length'] || 0
                            }
                        })
                        .catch(e => {
                            return 0
                        })

                    img.size = size
                    imgs.push(img)
                }
            } catch (e) {
                console.log(e)
            }
            console.log("--------", 4)
            try {
                await page.goto(`https://www.google.com/search?q=site%3A${url}`, {
                    waitUntil: 'networkidle0',
                })
                inGoogleSearch = await page.evaluate(() => {
                    return document.querySelector("#result-stats").innerHTML.split("<nobr>")[0].split(" ").at(-1)
                })
            } catch (e) {
                console.log("!!!!!", e)
            }
            await page?.close();
        }
    } catch (err) {
        console.error(err);
    } finally {
        await browser?.close();
        setTimeout(function (pid) {
            console.log("!!!pid!!!", pid)
            exec('kill -KILL ' + pid, (error, stdout, stderr) => {
            });
        }, 1000, browserPID);
    }
    if (!loadError) {
        try {
            // -------------------------------- rules --------------------------------
            // --- title ---
            // Длина метатега title (тайтл) – должна быть в пределах 70-80 знаков или 10-12 слов, сформированных в связную фразу с использованием ключевых фраз.
            if (!title || title?.length < 5) {
                result.push({
                    type: "error",
                    text: "Title not specified."
                })
            } else if (title?.length < 30 || title?.length > 79) {
                result.push({
                    type: "warning",
                    text: `The length of the title meta tag should be between 70-80 characters. Current length: ${title?.length}.`
                })
            }
            console.log("--------", 5)
            // --- img ---
            // Картинки должны содержать атрибут alt TODO: !!!
            imgs.forEach(img => {
                if (img?.src?.length > 0 && img?.alt?.length < 3) {
                    result.push({
                        type: "warning",
                        text: `Image(${img?.src}) must contain the alt attribute.`
                    })
                }
                if (img?.src && img?.size < 3) {
                    result.push({
                        type: "error",
                        text: `Error getting image(${img?.src}).`
                    })
                }
            })
            // --- tag ---
            // Один главный текстовый заголовок страницы — h1. Желательно соблюдение порядка использования заголовков (сначала h1, далее h2 и далее h3).
            if (tagsCount?.h1 !== 1) {
                result.push({
                    type: "error",
                    text: `The page must contain one h1 tag. Current count: ${tagsCount.h1}.`
                })
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
                })
            }
            // --- description ---
            //  Измените длину описания в теге <meta description> в исходном коде страницы до 25-160 символов.
            if (description?.length > 160 || description?.length < 26) {
                result.push({
                    type: "warning",
                    text: `The description tag should be 25-160 characters long. Current length: ${description?.length}.`
                })
            }
            console.log("--------", 6)
            // --- keywords ---
            // 150 знаков
            if (keywords?.length > 149 || keywords?.length < 20) {
                result.push({
                    type: "warning",
                    text: `The length of keywords should be in the range of 20-150 characters. Current length: ${keywords?.length}.`
                })
            }
            // --- inGoogleSearch ---
            if (inGoogleSearch === 0) {
                result.push({
                    type: "error",
                    text: `The page is not indexed by the Google search engine.`
                })
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
                })
            }
            // --- kb size ---
            const contentBitesLength = Buffer.from(content)?.length
            const contentKiloBytesLength = contentBitesLength / 1000
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
                })
            }
            console.log("--------", 7)
        } catch (e) {

        }
        return {
            status: 1,
            data: result
        }
    } else {
        return {
            status: 1,
            data: [
                {
                    type: "error",
                    text: `The page is not responding!`
                }
            ]
        }
    }
}