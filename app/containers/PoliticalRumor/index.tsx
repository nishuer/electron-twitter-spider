import React, { useState, useEffect } from 'react';
import { Button, Input, Row, Col, Alert, message, Modal } from 'antd';
import * as fs from 'fs';
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  AlignmentType,
  TextRun
} from 'docx';
import { FileWordOutlined, SettingOutlined } from '@ant-design/icons';
import styles from './index.scss';

const { dialog, app } = require('electron').remote;

const { TextArea } = Input;

let spiderData: any[] = [];
let urlList: any[] = [];
let indexFlag = 0;

export default function Home(props) {
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
  const [comment1, setComment1] = useState('');
  const [comment2, setComment2] = useState('');
  const [like1, setLike1] = useState('');
  const [like2, setLike2] = useState('');

  useEffect(() => {
    const webview: any = document.querySelector('webview');
    const xpathObj = JSON.parse(localStorage.getItem('xpath') as any) || {};

    setName(xpathObj.name);
    setContent(xpathObj.content);
    setTime1(xpathObj.time1);
    setTime2(xpathObj.time2);
    setComment1(xpathObj.comment1);
    setComment2(xpathObj.comment2);
    setLike1(xpathObj.like1);
    setLike2(xpathObj.like2);

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

      webview.capturePage().then((image: any) => {
        spiderData.push({
          ...event.args[0],
          img: image.toPNG()
        });

        if (indexFlag >= urlList.length) {
          console.log('Spider finished successfully!');
          console.log(spiderData);

          message.success('?????????????????????"????????????"', 5);
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
    const docData: any[] = [];

    spiderData.forEach((item, index) => {
      const doc = new Document();
      const paragraphList: any[] = [];

      const time = item.time.split('??');

      paragraphList.push(
        new Paragraph({
          text: `????????????????????????`,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER
        })
      );

      paragraphList.push(
        new Paragraph({
          text: ''
        })
      );

      paragraphList.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: `?????????????????????`,
              color: '000000',
              bold: true
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `???????????????${item.name}???${time[1]}${time[0]}?????????${item.content}????????????????????????????????????`,
              color: '000000',
              size: 26
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          text: ''
        })
      );

      paragraphList.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: `?????????????????????`,
              color: '000000',
              bold: true
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `???????????????${item.name}???${item.time}?????????${item.content}????????????????????????????????????`,
              color: '000000',
              size: 26
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          text: ''
        })
      );

      paragraphList.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: `???????????????????????????`,
              color: '000000',
              bold: true
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `?????????????????????`,
              color: '000000',
              size: 26
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          text: ''
        })
      );

      paragraphList.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: `?????????????????????`,
              color: '000000',
              bold: true
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${item.url}`,
              color: '000000',
              size: 26
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          text: ''
        })
      );

      paragraphList.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: `????????????????????????????????????`,
              color: '000000',
              bold: true
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `????????????${item.comment}?????????????????????${item.like}????????????`,
              color: '000000',
              size: 26
            })
          ]
        })
      );

      paragraphList.push(
        new Paragraph({
          text: ''
        })
      );

      paragraphList.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: `????????????????????????`,
              color: '000000',
              bold: true
            })
          ]
        })
      );

      doc.addSection({
        children: paragraphList
      });

      docData.push(doc);
    });

    const promises = docData.map(item => {
      return Packer.toBuffer(item);
    });

    Promise.all(promises)
      .then(buffer => {
        console.log('Document created successfully!');

        const today = new Date();
        const todayStr = today.getMonth() + 1 + '-' + today.getDate();

        return dialog
          .showSaveDialog({ defaultPath: `${todayStr}-yaoyan` })
          .then((path: any) => {
            console.log(path);
            fs.mkdirSync(path.filePath)
            buffer.forEach((item, index) => {
              path.filePath && fs.writeFileSync(`${path.filePath}/${index + 1}.docx`, item);
              fs.writeFileSync(`${path.filePath}/${index + 1}.png`, spiderData[index].img)
            })
          })
      })
      .catch(e => {
        console.log(e);
      });
  };

  const handleSettingOk = () => {
    const data = {
      name,
      content,
      time1,
      time2,
      comment1,
      comment2,
      like1,
      like2
    };

    localStorage.setItem('xpath', JSON.stringify(data));

    setModalVisible(false);
    message.success('????????????');
  };

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <TextArea
          disabled={running}
          placeholder="??????????????????????????????"
          rows={23}
          value={urls}
          onChange={handleChangeUrls}
        />
        <Alert
          message="??????????????????????????????VPN"
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
              {running ? '?????????' : '??????'}
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
              ??????
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
              ????????????
            </Button>
            <SettingOutlined
              style={{ fontSize: '20px', marginTop: '10px', color: '#666' }}
              onClick={() => setModalVisible(true)}
            />
          </Col>
        </Row>
      </div>
      <Modal
        title="??????"
        visible={modalVisible}
        onOk={handleSettingOk}
        onCancel={() => setModalVisible(false)}
      >
        <span>???????????????</span>
        <TextArea value={name} onChange={e => setName(e.target.value)} />
        <br />
        <br />
        <span>???????????????</span>
        <TextArea value={content} onChange={e => setContent(e.target.value)} />
        <br />
        <br />
        <span>????????????1???</span>
        <TextArea value={time1} onChange={e => setTime1(e.target.value)} />
        <br />
        <br />
        <span>????????????2???</span>
        <TextArea value={time2} onChange={e => setTime2(e.target.value)} />
        <br />
        <br />
        <span>???????????????1???</span>
        <TextArea
          value={comment1}
          onChange={e => setComment1(e.target.value)}
        />
        <br />
        <br />
        <span>???????????????2???</span>
        <TextArea
          value={comment2}
          onChange={e => setComment2(e.target.value)}
        />
        <br />
        <br />
        <span>??????1???</span>
        <TextArea value={like1} onChange={e => setLike1(e.target.value)} />
        <br />
        <br />
        <span>??????2???</span>
        <TextArea value={like2} onChange={e => setLike2(e.target.value)} />
      </Modal>
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
