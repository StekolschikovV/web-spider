import explorer from "./explorer";
import { ITorSite } from "./type";

class Tor {
    public async get(url: string): Promise<any> {

        console.log("getTor", url)

        let response: ITorSite = {}
        let page

        try {
            page = await explorer.getTorPage(url)
            // screenshot
            const screenshotFileName = url.split('/')[2].replaceAll('.', '-') + ".png"
            await page?.screenshot({
                path: `${process.env.TEMP_DIRECTORY}${screenshotFileName}`,
                fullPage: false
            })
            // link
            response.links = await page?.$$eval('a', links => links?.map(a => a.href))
            // innerHtml
            response.innerHtml = await page?.content()
            // title
            response.title = await page?.title()
            // keywords
            response.description = await page?.evaluate(() => {
                return document?.querySelector('meta[name="description"]')?.getAttribute("content") || ""
            }) as string
            // description
            response.description = await page?.evaluate(() => {
                return document.querySelector('meta[name="description"]')?.getAttribute("content") || ""
            }) as string
            // innerText
            response.innerText = await page?.$eval('*', (el: any) => el?.innerText);
            // screenshot
            response.screenshot = await page?.screenshot({
                encoding: "base64",
                quality: 100,
                type: 'jpeg',
            }).then(function (data) {
                let base64Encode = `data:image/png;base64,${data}`;
                return base64Encode;
            })
        } catch (e) {
            response.statusCode = 600
        } finally {
            // page?.close()
        }

        if (response?.title) {

            console.log("getTor return", 1)

            return {
                status: 1,
                data: response,
                test: {
                    title: response?.title,
                    description: response?.description,
                    keywords: response?.keywords,
                }
            }

        } else {

            console.log("getTor return", 3)

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
}

const tor = new Tor()

export default tor