import express, { Express, Request, Response } from 'express';
import { execSync } from 'child_process';
import { url } from 'inspector';
import path from 'path';
import * as fs from "fs";
import { getSEO } from "./SEO";
import tor from './tor';
import { urlToFileName, fixUtl, addLoader, errorHtml, getTopPreviewer } from './previewer';

const urlParser = require('url')
const app: Express = express();
const port = process.env.PORT || 1340;

app.get('/healthcheck', async (req: Request, res: Response) => {

    let torResponse, seoResponse

    try {
        const url = "https://www.mozilla.org/"
        const torUrl = "http://underdiriled6lvdfgiw4e5urfofuslnz7ewictzf76h4qb73fxbsxad.onion/"
        torResponse = await tor.get(torUrl)
        seoResponse = await getSEO(url)
    } catch (e) { }

    if (torResponse?.status === 1 && seoResponse?.status === 1) {
        console.log("healthcheck", 1)
        res.status(200).json({
            status: 1
        })
    } else {
        process.exit(1);
        console.log("healthcheck", 0)
        res.status(500).json({
            status: 0
        })
    }
});

app.get('/previewer', async (req: Request, res: Response) => {

    const unresponsiveText = "This page is currently unresponsive. Try again later or check the url. <button onclick='window.location.reload()' style='cursor: pointer; background: transparent; color: white; border: 0; display: block; margin: auto; font-size: 24px; padding: 40px;'>Reload now</button><button onclick='history.back()' style='background: transparent; color: white; border: 0; display: block; margin: auto; font-size: 16px; padding: 0px;cursor: pointer;'>Go Back</button>"
    const { url } = urlParser.parse(req.url, true).query

    if (url && typeof url === "string") {

        const pageFileName = urlToFileName(url)
        const pageHtmlFilePath = path.join(__dirname, 'cache', `${pageFileName}.html`);
        const pageMhtmlFilePath = path.join(__dirname, 'cache', `${pageFileName}.mhtml`);

        if (!fs.existsSync(path.join(__dirname, 'cache'))) {
            fs.mkdirSync(path.join(__dirname, 'cache'))
        }
        if (fs.existsSync(pageHtmlFilePath)) {
            const html = await fs.readFileSync(pageHtmlFilePath, 'utf8');
            res.send(fixUtl(addLoader(html)));
        } else {

            const pageMhtml: any = await getTopPreviewer(url)

            if (pageMhtml) {

                await fs.writeFileSync(pageMhtmlFilePath, pageMhtml);

                let mhtml2htmlError = false

                try {
                    let result = execSync(
                        `mhtml2html ${pageFileName}.mhtml ${pageFileName}.html`,
                        { cwd: path.join('./dist/', 'cache') }
                    )
                    fs.unlink(pageMhtmlFilePath, () => {
                    })
                } catch (e) {
                    mhtml2htmlError = true
                }
                if (mhtml2htmlError) {
                    res.status(500).send(errorHtml("Error in page decoding. Try again later or check the url."));
                } else {
                    try {
                        const html = await fs.readFileSync(pageHtmlFilePath, 'utf8');
                        res.status(200).send(fixUtl(addLoader(html)));
                    } catch (e) {
                        res.status(500).send(errorHtml(unresponsiveText));
                    }
                }
            } else {
                res.status(500).send(errorHtml(unresponsiveText));
            }
        }
    }
})

app.get('/tor', async (req: Request, res: Response) => {

    const { url } = urlParser.parse(req.url, true).query

    if (url) {
        const response = await tor.get(url)
        res.status(200).json(response)
    } else {
        res.json({
            status: 0,
            error: "not url"
        })
    }
})

app.get('/seo', async (req: Request, res: Response) => {

    const { url } = urlParser.parse(req.url, true).query

    if (url) {
        const seo = await getSEO(url)
        res.status(200).json(seo)
    } else {
        res.status(200).json({
            status: 0
        })
    }
})

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});