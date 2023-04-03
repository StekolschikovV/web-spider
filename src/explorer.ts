import puppeteer, { Browser, Page } from "puppeteer";

class Explorer {

    browser: Browser

    constructor() {
        this.init()
    }

    private init = async () => {
        this.browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox',],
            headless: true,
            // executablePath: '/usr/bin/google-chrome',
        })
    }

    public getPage = async (url: string): Promise<Page | null> => {
        try {
            const [page] = await this.browser.pages();
            await page?.setViewport({ width: 1080, height: 1024 })
            await page?.goto(url, {
                waitUntil: 'networkidle0'
            })
            return page
        } catch (e) {
            return null
        }
    }

    public close = async () => {
        await this.browser?.close();
    }

}
const explorer = new Explorer()

export default explorer