import React, { useState, useEffect } from 'react';
import { Button, Input, Row, Col, Alert, message } from 'antd';
import * as fs from 'fs';
import { Document, Packer, Paragraph, Media } from 'docx';
import { FileWordOutlined } from '@ant-design/icons';
import styles from './Home.css';

const { dialog, app } = require('electron').remote;

const { TextArea } = Input;

let spiderData: any[] = [];
let urlList: any[] = [];
let indexFlag = 0;

export default function Home() {
  const [webviewUrl, setWebviewUrl] = useState('');
  const [urls, setUrls] = useState('');
  const [running, setRunning] = useState(false);
  const [isFinish, setIsFinish] = useState(false);
  const [isCanStart, setIsCanStart] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const webview: any = document.querySelector('webview');

    webview.addEventListener('dom-ready', () => {
      webview.openDevTools();
    });
  }, []);

  useEffect(() => {
    const webview: any = document.querySelector('webview');

    const ipcListener = (event: any) => {
      console.log(event.channel);
      console.log(event.args);

      if (!running) return;
      if (event.channel !== 'spider-done') return;

      webview
        .capturePage()
        .then((image: any) => {
          spiderData.push({
            ...event.args[0],
            img: image.toPNG()
          });

          if (indexFlag >= urlList.length) {
            console.log('Spider finished successfully!');
            console.log(spiderData);

            message.success('已完成，请点击"下载文档"', 5);
            reset();
            setIsFinish(true);
          } else {
            requestVeiwUrl(urlList[indexFlag]);
          }
        });
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

  const requestVeiwUrl = (url: string) => {
    setWebviewUrl(url);
    indexFlag++;
  };

  const handleStart = async () => {
    urlList = urls.split('\n');

    setRunning(true);
    setIsFinish(false);
    spiderData = [];

    requestVeiwUrl(urlList[indexFlag]);
  };

  const reset = () => {
    urlList = [];
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
      url: '内容网址',
      time: '发布时间',
      name: '发布用户',
      content: '详细内容'
    };

    spiderData.forEach((item, index) => {
      paragraphList.push(
        new Paragraph({
          text: `序号：${index + 1}`
        })
      );
      Object.keys(labelMap).forEach(key => {
        paragraphList.push(
          new Paragraph({
            text: `${labelMap[key]}：${item[key]}`
          })
        );
      });
      paragraphList.push(
        new Paragraph({
          text: '内容截图：'
        })
      );
      const image = Media.addImage(doc, item.img, 600, 780);
      paragraphList.push(new Paragraph(image));
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

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <TextArea
          disabled={running}
          placeholder="请输入网址，每行一个"
          rows={23}
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
        <Row gutter={16} style={{ marginTop: '30px' }}>
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
          </Col>
        </Row>
      </div>
      <webview
        className={styles.webview}
        src={webviewUrl}
        preload={
          process.env.NODE_ENV === 'development'
            ? `file://${__dirname}/preload.js`
            : `file://${app.getAppPath()}/preload.js`
        }
      />
    </div>
  );
}
