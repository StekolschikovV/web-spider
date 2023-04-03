import express, { Express, Request, Response } from 'express';
import { getSEO } from "./SEO";
import axios from "axios";
import explorer from './explorer';

const urlParser = require('url')
const queue = require('express-queue')
const cacheService = require("express-api-cache")

const cache = cacheService.cache
const app: Express = express();
const port = process.env.PORT || 3000;

// app.use(queue({ activeLimit: 1, queuedLimit: -1 }));

// app.get('/get-seo', cache("1 minutes"), async (req: Request, res: Response) => {
//     console.log("version", 2)
//     const { url } = urlParser.parse(req.url, true).query
//     if (url) {
//         res.json(await getSEO(url))
//     } else {
//         res.status(400).json({
//             status: 0
//         })
//     }
// });

// app.get('/healthcheck', async (req: Request, res: Response) => {
//     const response = await axios.get(`https://spider.stekolschikov.com/get-seo?url=https://www.google.com/`)
//         .then(e => e.data)
//     if (response?.status === 1 && response?.data?.length === 6) {
// res.status(200).json({
//     status: 0
// })
//     } else {
//         process.exit(1);
//     }

// });




app.get('/page', async (req: Request, res: Response) => {
    const { url } = urlParser.parse(req.url, true).query
    if (url) {
        const page = await explorer.getPage(url)
        const title = await page?.title()
        res.status(200).json({
            status: 1,
            data: {
                title
            }
        })
    } else {
        res.status(200).json({
            status: 0
        })
    }
})

app.get('/close', async (req: Request, res: Response) => {
    explorer.close()
    res.status(200).json({
        status: 1
    })
})





app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});