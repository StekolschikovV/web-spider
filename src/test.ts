'use strict';

const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.google.com/search?q=site:tor-sites.link';
const fs = require('fs');

const getPage = (cb) => {
    request(url, {
        timeout: 3000
    }, (error, response, body) => {
        if (!error) {
            parsePage(body)
            cb(body);
        }
    });
};

const savePage = (data) => {
    let contents = "'use strict';" + '\n\n';
    contents += 'const HTMLItArticles = ';
    contents += JSON.stringify(data) + ';\n\n';
    contents += 'module.exports = HTMLItArticles;';

    fs.writeFileSync(__dirname + '/articles.js', contents);
};

const parsePage = (data) => {
    const $ = cheerio.load(data);
    let output = [];
    console.log("+++", $("#result-stats").text())
    $("#result-stats").each((i, elem) => {
        console.log(elem)
        let $a = $(elem).find('a');
        let datum = {
            title: $a.text(),
            url: $a.attr('href')
        };
        output.push(elem);
    });
    return output;
};

getPage((e) => {
    console.log("~", e)
})