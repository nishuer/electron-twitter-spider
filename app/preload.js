const { ipcRenderer } = require('electron');

let isStart = false;
let xpathObj = {};

ipcRenderer.on('start', (e, msg) => {
  console.log(e);
  console.log(msg);

  isStart = true;
  xpathObj = msg;

  const urlElement = document.createElement('input');
  urlElement.style.width = '100%';
  urlElement.style.height = '30px';
  urlElement.style.position = 'absolute';
  urlElement.style.zIndex = 999999;
  urlElement.style.fontSize = '14px';
  urlElement.value = window.location.href;
  const first = document.body.firstChild;
  document.body.insertBefore(urlElement, first);
});

const getElementByXPath = path => {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
};

const getTimeStr = (time, time2) => {
  let node = null;

  if (time && time.textContent && time.textContent.includes('年')) {
    node = time;
  } else if (time2 && time2.textContent && time2.textContent.includes('年')) {
    node = time2;
  } else {
    return '';
  }

  const arr = node.textContent.split('·');
  return `${arr[0]}·${arr[1]}`;
};

const waitForExternal = setInterval(() => {
  if (!isStart) return;

  const name = getElementByXPath(xpathObj.name);

  const content = getElementByXPath(xpathObj.content);

  const time = getElementByXPath(xpathObj.time1);

  const time2 = getElementByXPath(xpathObj.time2);

  const comment1 = getElementByXPath(xpathObj.comment1);

  const comment2 = getElementByXPath(xpathObj.comment2);

  const like1 = getElementByXPath(xpathObj.like1);

  const like2 = getElementByXPath(xpathObj.like2);

  // e.g. https://twitter.com/soulgoo/status/1252434143419305989
  // const time3 = getElementByXPath(xpathObj.time3);

  if (name && content && (time || time2)) {
    clearInterval(waitForExternal);

    const data = {
      // eslint-disable-next-line no-restricted-globals
      url: location.href,
      time: getTimeStr(time, time2),
      name: name.textContent,
      content: content.textContent,
      comment: comment1 ? comment1.textContent || comment2.textContent || 0 : 0,
      like: like1 ? like1.textContent || like2.textContent || 0 : 0
    };

    // 这里延迟2秒，不然 webview 截图截不到内容
    setTimeout(() => {
      ipcRenderer.sendToHost('spider-done', data);
    }, 2000);
  } else {
    // eslint-disable-next-line no-console
    console.log('not found!');
  }
}, 100);
