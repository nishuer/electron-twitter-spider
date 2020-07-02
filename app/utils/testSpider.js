const cluster = require('cluster');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const bdurl = `https://m.toutiao.com/search/?keyword=mojito&pd=weitoutiao&source=sug&traffic_source=&original_source=&in_tfs=&in_ogs=&format=json&count=10&offset=10&from=weitoutiao&search_id=20200629162150010010068017160F8223&start_index=10&index_resource=&filter_vendor=&filter_period=&min_time=&max_time=&from_search_id=`;

// eslint-disable-next-line promise/catch-or-return
axios
  .get(encodeURI(bdurl), {
    headers: {
      Cookie:
        'tt_webid=6843688746404840973; WIN_WH=375_667; PIXIEL_RATIO=2; SLARDAR_WEB_ID=6843688746404840973',
      Connection: 'keep-alive',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
    }
  })
  // eslint-disable-next-line promise/always-return
  .then(response => {
    console.log(response);
    // const $ = cheerio.load(response.data);
  });
