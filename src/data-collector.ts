import { Page } from "puppeteer";

export interface ITagsCount {
    h1: number,
    h2: number,
    h3: number,
    h4: number,
    p: number
}

export interface IImage {
    src: string
    alt: string
    size: number
}

class DataCollector {

    getDescription = async (page: Page): Promise<string> => {
        let description = ""
        try {
            description = await page?.$eval('meta[name="description"]', el => el?.content);
        } catch (e) {
        }
        return description
    }

    getKeywords = async (page: Page): Promise<string> => {
        let keywords = ""
        try {
            keywords = await page?.$eval('meta[name="keywords"]', el => el?.content);
        } catch (e) {
        }
        return keywords
    }

    getTagsCount = async (page: Page): Promise<ITagsCount> => {
        let result
        try {
            result = await page?.evaluate(() => {
                return {
                    h1: Array.from(document?.querySelectorAll('h1'))?.length,
                    h2: Array.from(document?.querySelectorAll('h2'))?.length,
                    h3: Array.from(document?.querySelectorAll('h3'))?.length,
                    h4: Array.from(document?.querySelectorAll('h4'))?.length,
                    p: Array.from(document?.querySelectorAll('p'))?.length
                }
            })
        } catch (e) {
            result = {
                h1: 0,
                h2: 0,
                h3: 0,
                h4: 0,
                p: 0
            }
        }
        return result
    }

    public getImages = async (page: Page): Promise<IImage[]> => {
        let images: IImage[] = []
        try {
            const _imgs = await page?.$$eval('img[src]', imgs => imgs?.map(img => {
                return {
                    src: img?.getAttribute('src'),
                    alt: img?.getAttribute('alt'),
                    size: 0
                }
            }))
        } catch (e) { }
        return images
    }

    public getInGoogleSearch = async (page: Page): Promise<number> => {
        let result = 0
        try {
            result = +(await page?.evaluate(() => {
                return document?.querySelector("#result-stats")?.innerHTML?.split("<nobr>")[0].split(" ").at(-1)
            }))
        } catch (e) { }
        return result
    }

}

const dataCollector = new DataCollector()

export default dataCollector