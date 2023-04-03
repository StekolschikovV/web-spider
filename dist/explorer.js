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
const puppeteer_1 = __importDefault(require("puppeteer"));
class Explorer {
    constructor() {
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            this.browser = yield puppeteer_1.default.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox',],
                headless: true,
                // executablePath: '/usr/bin/google-chrome',
            });
        });
        this.getPage = (url) => __awaiter(this, void 0, void 0, function* () {
            try {
                const [page] = yield this.browser.pages();
                yield (page === null || page === void 0 ? void 0 : page.setViewport({ width: 1080, height: 1024 }));
                yield (page === null || page === void 0 ? void 0 : page.goto(url, {
                    waitUntil: 'networkidle0'
                }));
                return page;
            }
            catch (e) {
                return null;
            }
        });
        this.close = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield ((_a = this.browser) === null || _a === void 0 ? void 0 : _a.close());
        });
        this.init();
    }
}
const explorer = new Explorer();
exports.default = explorer;
