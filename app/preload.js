const { ipcRenderer } = require('electron');

let isStart = false;
let xpathObj = {};

ipcRenderer.on('start', (e, msg) => {
  console.log(e);
  console.log(msg);

  isStart = true;
  xpathObj = msg;
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

const getTimeStr = (time, time2, time3) => {
  let node = null;

  if (time && time.textContent && time.textContent.includes('年')) {
    node = time;
  } else if (time2 && time2.textContent && time2.textContent.includes('年')) {
    node = time2;
  } else if (time3 && time3.textContent && time3.textContent.includes('年')) {
    node = time3;
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

  // e.g. https://twitter.com/soulgoo/status/1252434143419305989
  const time3 = getElementByXPath(xpathObj.time3);

  if (name && content && (time || time2 || time3)) {
    clearInterval(waitForExternal);

    const data = {
      // eslint-disable-next-line no-restricted-globals
      url: location.href,
      time: getTimeStr(time, time2, time3),
      name: name.textContent,
      content: content.textContent
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
