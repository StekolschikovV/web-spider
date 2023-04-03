"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const explorer_1 = __importDefault(require("./explorer"));
const urlParser = require('url');
const queue = require('express-queue');
const cacheService = require("express-api-cache");
const cache = cacheService.cache;
const app = (0, express_1.default)();
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
app.get('/page', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = urlParser.parse(req.url, true).query;
    if (url) {
        const page = yield explorer_1.default.getPage(url);
        const title = yield (page === null || page === void 0 ? void 0 : page.title());
        res.status(200).json({
            status: 1,
            data: {
                title
            }
        });
    }
    else {
        res.status(200).json({
            status: 0
        });
    }
}));
app.get('/close', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    explorer_1.default.close();
    res.status(200).json({
        status: 1
    });
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
