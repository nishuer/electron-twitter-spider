import React, { useState, useEffect } from 'react';
import { Button, Input, Row, Col, Alert, message, Modal } from 'antd';
import * as fs from 'fs';
import {
  Document,
  Packer,
  Paragraph,
  Media,
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

  const [weiboAccounts, setWeiboAccounts] = useState('');

  useEffect(() => {
    const webview: any = document.querySelector('webview');
    const weiboAccountsData =
      JSON.parse(localStorage.getItem('weiboAccounts') as any) || {};

    setWeiboAccounts(weiboAccountsData);

    webview.addEventListener('dom-ready', () => {
      if (process.env.NODE_ENV === 'development') {
        webview.openDevTools();
      }

      webview.send('start', weiboAccountsData);
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
        })
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

      const time = item.time.split('·');

      paragraphList.push(
        new Paragraph({
          text: `【涉习突出谣言】`,
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
              text: `一、基本情况：`,
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
              text: `推特网民“${item.name}”${time[1]}${time[0]}发布“${item.content}”的谣言，建议部局封堵。`,
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
              text: `二、具体内容：`,
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
              text: `推特网民“${item.name}”${item.time}发布“${item.content}”的谣言，建议部局封堵。`,
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
              text: `三、主要炒作方向：`,
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
              text: `涉领导人与涉政`,
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
              text: `四、原文链接：`,
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
              text: `五、传播情况及突出评论：`,
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
              text: `目前共有${item.comment}次转发及评论，${item.like}人次喜欢`,
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
              text: `六、截图请见附件`,
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
            fs.mkdirSync(path.filePath);
            buffer.forEach((item, index) => {
              path.filePath &&
                fs.writeFileSync(`${path.filePath}/${index + 1}.docx`, item);
              fs.writeFileSync(
                `${path.filePath}/${index + 1}.png`,
                spiderData[index].img
              );
            });
          });
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
    message.success('保存成功');
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
            <SettingOutlined
              style={{ fontSize: '20px', marginTop: '10px', color: '#666' }}
              onClick={() => setModalVisible(true)}
            />
          </Col>
        </Row>
      </div>
      <Modal
        title="设置"
        visible={modalVisible}
        onOk={handleSettingOk}
        onCancel={() => setModalVisible(false)}
      >
        <span>采集账号：</span>
        <TextArea
          rows={20}
          placeholder="每行一个微博账号ID"
          value={weiboAccounts}
          onChange={e => setWeiboAccounts(e.target.value)}
        />
      </Modal>
      <webview
        className={styles.webview}
        src={webviewUrl}
        preload={
          process.env.NODE_ENV === 'development'
            ? `file://${__dirname}/greatFirewallPreload.js`
            : `file://${app.getAppPath()}/greatFirewallPreload.js`
        }
      />
    </div>
  );
}
