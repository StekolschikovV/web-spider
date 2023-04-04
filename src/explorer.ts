import puppeteer, { Browser, Page } from "puppeteer";

class Explorer {

    browser: Browser
    torBrowser: Browser

    constructor() {
        this.init()
    }

    private init = async () => {
        this.browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
            defaultViewport: { width: 1080, height: 1024 },
            ...(process.env.MODE === "docker" && { executablePath: '/usr/bin/google-chrome' }),
        })
        this.torBrowser = await puppeteer
            .launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--proxy-server=socks5://localhost:9050'],
                defaultViewport: { width: 1080, height: 1024 },
                ...(process.env.MODE === "docker" && { executablePath: '/usr/bin/google-chrome' }),
            })
    }

    public getPage = async (url: string): Promise<Page | null> => {
        try {
            const [page] = await this.browser.pages();
            await page?.goto(url, { waitUntil: 'networkidle0' })
            return page
        } catch (e) {
            return null
        }
    }


    public getTorPage = async (url: string): Promise<Page | null> => {
        try {
            const [page] = await this.torBrowser.pages();
            await page?.goto(url, { waitUntil: 'networkidle0' })
            return page
        } catch (e) {
            return null
        }
    }

    public close = async () => {
        await this.browser?.close();
        await this.torBrowser?.close();
    }

}
const explorer = new Explorer()

export default explorer