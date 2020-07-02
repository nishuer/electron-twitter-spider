const cluster = require('cluster');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

function spider(params) {
  const pn = params * 10;
  const keyword = '高考顶替';

  const bdurl = `https://www.baidu.com/s?ie=utf-8&cl=2&medium=1&rtt=4&bsst=1&rsv_dl=news_b_pn&tn=news&wd=${keyword}&tfflag=0&x_bfe_rqs=03E80&x_bfe_tjscore=0.513809&tngroupname=organic_news&newVideo=12&pn=${pn}`;

  axios
    .get(encodeURI(bdurl), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36'
      }
    })
    // eslint-disable-next-line promise/always-return
    .then(response => {
      // console.log(response);
      const $ = cheerio.load(response.data);

      const list = [];

      $('.result').each((key, ele) => {
        const title = $(ele)
          .find('.c-title')
          .text()
          .trim();

        const url = $(ele)
          .find('.c-title a')
          .attr('href')
          .trim();

        const authorArr = $(ele)
          .find('.c-author')
          .text()
          .trim()
          .split(' ');

        const author = authorArr[0].trim();
        const datetime = `${authorArr[
          authorArr.length - 2
        ].trim()}${' '}${authorArr[authorArr.length - 1].trim()}`.trim();

        const desc = (
          $(ele)
            .find('.c-span18')
            .text() ||
          $(ele)
            .find('.c-summary')
            .text()
        )
          .replace(author, '')
          .replace(datetime, '')
          .replace('百度快照', '')
          .trim();

        list.push({
          title,
          url,
          author,
          datetime,
          desc
        });

        // console.log(title);
        // console.log(author);
        // console.log(datetime);
        // console.log(desc);
        // console.log('');
      });

      process.send(list);
    })
    .catch(error => {
      console.log(error);
      process.send('interrupt');
    });
}

// 判断当前执行的进程是否为主进程，为主进程则创建子进程，否则用子进程执行爬虫
if (cluster.isMaster) {
  const authorList = [];
  const finalList = {};

  let list = [];
  const count = 10;
  let num = 10;

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < count; i++) {
    const work = cluster.fork();

    // eslint-disable-next-line no-loop-func
    work.on('message', params => {
      // eslint-disable-next-line no-plusplus
      num--;

      if (params !== 'interrupt') {
        list = list.concat(params);
      }

      if (num === 0) {
        list.forEach((item, index) => {
          if (!authorList.includes(item.author)) {
            authorList.push(item.author);
            finalList[item.author] = [];
          }

          finalList[item.author].push(item);
        });

        Object.keys(finalList).forEach(key => {
          fs.writeFileSync('./data.txt', `${key}\n\n`, { flag: 'a' }, function(err) {
            if (err) {
              console.log(err);
            }
          });

          finalList[key].forEach((item, index) => {
            const str = `标题：${item.title}\n发布网站：${item.author}\n发布时间：${item.datetime}\n内容：${item.desc}链接：${item.url}\n\n`;
            fs.writeFileSync('./data.txt', str, { flag: 'a' }, function(err) {
              if (err) {
                console.log(err);
              }
            });
          });
        });

        // console.log(finalList);
      }
    });

    work.send(i);
  }
} else {
  process.on('message', params => {
    try {
      spider(params);
    } catch (error) {
      process.send('interrupt');
    }
  });
}
