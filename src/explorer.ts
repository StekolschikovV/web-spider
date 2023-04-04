import puppeteer, { Browser, Page } from "puppeteer";

// TODO: delete after test
console.log("~~~~~MODE", process.env.MODE)

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
        console.log('getTorPage', 1);
        try {
            const [page] = await this.torBrowser.pages();
            console.log('getTorPage', 2, page);
            await page?.goto(url, { waitUntil: 'networkidle0' })
            console.log('getTorPage', 3.);
            return page
        } catch (e) {
            console.log('getTorPage', 4, e);
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