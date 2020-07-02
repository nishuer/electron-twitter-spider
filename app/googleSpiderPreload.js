const { ipcRenderer } = require('electron');
const cheerio = require('cheerio');

let isStart = false;
let xpathObj = {};

ipcRenderer.on('start', (e, msg) => {
  console.log(e);
  console.log(msg);

  isStart = true;
  xpathObj = msg;
});

const waitForExternal = setInterval(() => {
  if (!isStart) return;

  const foot = document.getElementById('foot');

  if (foot) {
    clearInterval(waitForExternal);

    const $ = cheerio.load(document.documentElement.outerHTML);
    const list = [];

    $('.g').each((key, ele) => {
      const title = $(ele)
        .find('.l.lLrAF')
        .text()
        .trim();

      const url = $(ele)
        .find('.l.lLrAF')
        .attr('href')
        .trim();

      const author = $(ele)
        .find('.xQ82C.e8fRJf')
        .text()
        .trim();

      const datetime = $(ele)
        .find('.f.nsa.fwzPFf')
        .text()
        .trim();

      const desc = $(ele)
        .find('.st')
        .text()
        .trim();

      list.push({
        title,
        url,
        author,
        datetime,
        desc
      });
    });

    // 这里延迟 5 秒，防止谷歌封锁 IP
    setTimeout(() => {
      ipcRenderer.sendToHost('spider-done', list);
    }, 5000);
  } else {
    // eslint-disable-next-line no-console
    console.log('not found!');
  }
}, 100);
