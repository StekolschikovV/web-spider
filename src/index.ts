import express, { Express, Request, Response } from 'express';
import { getSEO } from "./SEO";
import tor from './tor';

const urlParser = require('url')
const app: Express = express();
const port = process.env.PORT || 3000;

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
        console.log("healthcheck", 0)
        res.status(500).json({
            status: 0
        })
    }
});

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