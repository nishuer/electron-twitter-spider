import React, { useState, useEffect } from 'react';
import { Button, Input, Row, Col, Alert, message, Modal } from 'antd';
import * as fs from 'fs';
import { Document, Packer, Paragraph, Media } from 'docx';
import { FileWordOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './index.scss';

const { dialog, app } = require('electron').remote;

const { TextArea } = Input;

let spiderData: any[] = [];
let indexFlag = 0;

export default function Home() {
  const [webviewUrl, setWebviewUrl] = useState('');
  const [urls, setUrls] = useState('');
  const [running, setRunning] = useState(false);
  const [isFinish, setIsFinish] = useState(false);
  const [isCanStart, setIsCanStart] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [time1, setTime1] = useState('');
  const [time2, setTime2] = useState('');
  const [time3, setTime3] = useState('');

  useEffect(() => {
    const webview: any = document.querySelector('webview');
    const xpathObj = JSON.parse(localStorage.getItem('xpath') as any) || {};

    setName(xpathObj.name);
    setContent(xpathObj.content);
    setTime1(xpathObj.time1);
    setTime2(xpathObj.time2);
    setTime3(xpathObj.time3);

    webview.addEventListener('dom-ready', () => {
      if (process.env.NODE_ENV === 'development') {
        webview.openDevTools();
      }

      webview.send('start', xpathObj);
    });
  }, []);

  useEffect(() => {
    const webview: any = document.querySelector('webview');

    const ipcListener = (event: any) => {
      console.log(event.channel);
      console.log(event.args);

      if (!running) return;
      if (event.channel !== 'spider-done') return;

      spiderData = spiderData.concat(event.args[0]);

      if (indexFlag >= 10) {
        console.log('Spider finished successfully!');
        console.log(spiderData);

        message.success('已完成，请点击"下载文档"', 5);
        reset();
        setIsFinish(true);
      } else {
        requestVeiwUrl();
      }
    };

    webview.addEventListener('ipc-message', ipcListener);

    return () => {
      webview.removeEventListener('ipc-message', ipcListener);
    };
  }, [running]);

  useEffect(() => {
    if (urls.trim()) {
      setIsCanStart(true);
    } else {
      setIsCanStart(false);
    }
  }, [urls]);

  const handleChangeUrls = (e: any) => {
    setUrls(e.target.value);
  };

  const requestVeiwUrl = () => {
    const pn = indexFlag * 10;
    const url = `https://www.google.com/search?q=${urls}&tbs=sbd:1&tbm=nws&ei=BMvqXobYAoXZhwOQt4bgBw&start=${pn}&sa=N&ved=0ahUKEwiG6pnCoorqAhWF7GEKHZCbAXwQ8NMDCGk&biw=1440&bih=748&dpr=2`;
    console.log(url);
    setWebviewUrl(url);
    indexFlag++;
  };

  const handleStart = async () => {
    setWebviewUrl('https://google.com/ncr');

    setTimeout(() => {
      setRunning(true);
      setIsFinish(false);
      spiderData = [];

      requestVeiwUrl();
    }, 2000);
  };

  const reset = () => {
    indexFlag = 0;
    setRunning(false);
    setWebviewUrl('');
  };

  const handleStop = () => {
    reset();
  };

  const handleDownload = () => {
    const doc = new Document();
    const paragraphList: any = [];
    const labelMap: any = {
      title: '标题',
      url: '内容网址',
      datetime: '发布时间',
      author: '发布网站',
      desc: '简介'
    };

    const authorList: any[] = [];
    const finalList: any[] = [];

    spiderData.forEach((item, index) => {
      if (!authorList.includes(item.author)) {
        authorList.push(item.author);
        finalList[item.author] = [];
      }

      finalList[item.author].push(item);
    });

    Object.keys(finalList).forEach((key) => {
      paragraphList.push(
        new Paragraph({
          text: `${key}`
        })
      );
      paragraphList.push(new Paragraph({}));

      finalList[key].forEach((item, index) => {
        Object.keys(labelMap).forEach(key => {
          paragraphList.push(
            new Paragraph({
              text: `${labelMap[key]}：${item[key]}`
            })
          );
        });
        paragraphList.push(new Paragraph({}));
      });

      paragraphList.push(new Paragraph({}));
      paragraphList.push(new Paragraph({}));
    });

    doc.addSection({
      children: paragraphList
    });

    Packer.toBuffer(doc).then(buffer => {
      console.log('Document created successfully!');

      dialog
        .showSaveDialog({ defaultPath: '未命名.docx' })
        .then((path: any) => {
          console.log(path);
          path.filePath && fs.writeFileSync(path.filePath, buffer);
        });
    });
  };

  const handleSettingOk = () => {
    const data = {
      name,
      content,
      time1,
      time2,
      time3
    };

    localStorage.setItem('xpath', JSON.stringify(data));

    setModalVisible(false);
    message.success('保存成功');
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <Input
          disabled={running}
          placeholder="请输入舆情关键词"
          value={urls}
          onChange={handleChangeUrls}
        />
        <Alert
          message="开始前，请确认已打开VPN"
          type="info"
          showIcon
          style={{ marginTop: '20px' }}
        />
        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={12}>
            <Button
              block
              loading={running}
              disabled={!isCanStart}
              type="primary"
              size="large"
              onClick={handleStart}
            >
              {running ? '运行中' : '开始'}
            </Button>
          </Col>
          <Col span={12}>
            <Button
              block
              size="large"
              disabled={!running}
              danger
              onClick={handleStop}
            >
              停止
            </Button>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: '20px' }}>
          <Col span={24}>
            <Button
              block
              type="primary"
              disabled={!isFinish}
              size="large"
              icon={<FileWordOutlined />}
              onClick={handleDownload}
            >
              下载文档
            </Button>
            {/* <SettingOutlined
              style={{ fontSize: '20px', marginTop: '10px', color: '#666' }}
              onClick={() => setModalVisible(true)}
            /> */}
          </Col>
        </Row>
      </div>
      <Modal
        title="设置"
        visible={modalVisible}
        onOk={handleSettingOk}
        onCancel={() => setModalVisible(false)}
      >
        <span>用户昵称：</span>
        <TextArea value={name} onChange={e => setName(e.target.value)} />
        <br />
        <br />
        <span>详细内容：</span>
        <TextArea value={content} onChange={e => setContent(e.target.value)} />
        <br />
        <br />
        <span>发布时间1：</span>
        <TextArea value={time1} onChange={e => setTime1(e.target.value)} />
        <br />
        <br />
        <span>发布时间2：</span>
        <TextArea value={time2} onChange={e => setTime2(e.target.value)} />
        <br />
        <br />
        <span>发布时间3：</span>
        <TextArea value={time3} onChange={e => setTime3(e.target.value)} />
      </Modal>
      <webview
        className={styles.webview}
        src={webviewUrl}
        preload={
          process.env.NODE_ENV === 'development'
            ? `file://${__dirname}/googleSpiderPreload.js`
            : `file://${app.getAppPath()}/googleSpiderPreload.js`
        }
      />
    </div>
  );
}
