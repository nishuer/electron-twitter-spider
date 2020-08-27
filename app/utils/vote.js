const axios = require('axios');
const qs = require('qs');

const url = `http://me.amrtang.com/vote723/api/web/v1/answer/vote`;

function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const values = [20, 22, 24, 26, 28, 30]

function vote() {
  const m = Math.floor( Math.random() * values.length )
  const i = values[m]

  setTimeout(() => {
    vote()
  }, i * 1000);

  axios
  .post(
    encodeURI(url),
    qs.stringify({
      gid: 45,
      uid: guid(),
      time: 1480576266,
      token: 'c92114bcc9e4454f1d2b7399dc9d62a9',
      authToken: ''
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'micromessenger'
      }
    }
  )
  .then(response => {
    console.log(response.data);
  });
}

vote()
