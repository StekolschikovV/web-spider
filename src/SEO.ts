import axios from "axios";
import explorer from "./explorer";
import dataCollector, { IImage, ITagsCount } from "./data-collector";

interface ISEO {
    type: "warning" | "error"
    text: string
}

export const getSEO = async (url) => {

    console.log("getSEO", url)

    let result: ISEO[] = []
    let title, description, keywords, content, metrics, loadTime, inGoogleSearch
    let tagsCount: ITagsCount = {
        h1: 0,
        h2: 0,
        h3: 0,
        h4: 0,
        p: 0
    }
    let imgs: IImage[] = []

    let page = await explorer.getPage(url)
    content = await page?.content()
    title = await page?.title()
    metrics = await page?.metrics();
    loadTime = metrics?.TaskDuration
    keywords = await dataCollector.getKeywords(page)
    description = await dataCollector.getDescription(page)
    tagsCount = await dataCollector.getTagsCount(page)
    const _imgs = await dataCollector.getImages(page)

    for (let i in _imgs) {
        let img = _imgs[i];
        let _url = new URL(url);
        img.src = img?.src.startsWith('/') ? _url?.origin + img?.src : img?.src
        const size = await axios
            .get(img?.src)
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

    page = await explorer.getPage(url)
    inGoogleSearch = await dataCollector.getInGoogleSearch(page)

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

    if (tagsCount?.h1 !== 1) {
        result.push({
            type: "error",
            text: `The page must contain one h1 tag. Current count: ${tagsCount?.h1}.`
        })
    }

    if (tagsCount?.p === 0) {
        result.push({
            type: "warning",
            text: `Page content must be in the p tag.`
        })
    }

    if (description?.length > 160 || description?.length < 26) {
        result.push({
            type: "warning",
            text: `The description tag should be 25-160 characters long. Current length: ${description?.length}.`
        })
    }

    if (keywords?.length > 149 || keywords?.length < 20) {
        result.push({
            type: "warning",
            text: `The length of keywords should be in the range of 20-150 characters. Current length: ${keywords?.length}.`
        })
    }

    if (inGoogleSearch === 0) {
        result.push({
            type: "error",
            text: `The page is not indexed by the Google search engine.`
        })
    }

    if (loadTime > 3) {
        result.push({
            type: "error",
            text: `The page takes a critically long time to load. Loading time: ${loadTime} seconds.`
        })
    }

    const contentBitesLength = Buffer.from(content)?.length
    const contentKiloBytesLength = contentBitesLength / 1000

    if (125 < contentKiloBytesLength) {
        result.push({
            type: "warning",
            text: `The html size exceeds the allowed size of 125kb. Current size: ${contentKiloBytesLength}kb.`
        })
    }
    if (title) {

        console.log("getSEO return", 1)

        return {
            status: 1,
            data: result,
            test: {
                title,
                description,
                keywords,
            }
        }

    } else {

        console.log("getSEO return", 3)

        return {
            status: 3,
            data: [
                {
                    type: "error",
                    text: `The page is not responding!`
                }
            ]
        }
    }
}