const { ipcRenderer } = require('electron');

const getElementByXpath = path => {
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

  if (time.textContent.includes('年')) {
    node = time;
  } else if (time2.textContent.includes('年')) {
    node = time2;
  } else if (time3.textContent.includes('年')) {
    node = time3;
  } else {
    return '';
  }

  const arr = node.textContent.split('·');
  return `${arr[0]}·${arr[1]}`;
};

const waitForExternal = setInterval(() => {
  const name = getElementByXpath(
    '/html/body/div/div/div/div[2]/main/div/div/div/div/div/div/div/section/div/div/div/div[1]/div/div/div/article/div/div[2]/div[2]/div/div/div/div[1]/a/div'
  );

  const content = getElementByXpath(
    '/html/body/div/div/div/div[2]/main/div/div/div/div/div/div/div/section/div/div/div/div[1]/div/div/div/article/div/div[3]/div[1]/div'
  );

  const time = getElementByXpath(
    '/html/body/div/div/div/div[2]/main/div/div/div/div/div/div/div/section/div/div/div/div[1]/div/div/div/article/div/div[3]/div[3]/div/div'
  );

  const time2 = getElementByXpath(
    '/html/body/div/div/div/div[2]/main/div/div/div/div/div/div/div/section/div/div/div/div[1]/div/article/div/div/div[3]/div[2]'
  );

  const time3 = getElementByXpath(
    '/html/body/div/div/div/div[2]/main/div/div/div/div/div/div/div/section/div/div/div/div[1]/div/div/div/article/div/div[3]/div[2]/div/div'
  );

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
