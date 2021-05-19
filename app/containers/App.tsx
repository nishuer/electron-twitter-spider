import React, { ReactNode, useState } from 'react';
import { Tabs } from 'antd';
import { history } from '../store/configureStore';

const { TabPane } = Tabs;

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  const [currentTabIndex, setCurrentTabIndex] = useState('0');

  const handeChangeTabs = (key: React.SetStateAction<string>) => {
    setCurrentTabIndex(key);

    if (key === '0') {
      history.replace('/');
    }

    if (key === '1') {
      history.replace('/great-firewall');
    }

    if (key === '2') {
      history.replace('/twitter');
    }

    if (key === '3') {
      history.replace('/public-sentiment-report');
    }
  };

  return (
    <>
      <Tabs onChange={handeChangeTabs} defaultActiveKey={currentTabIndex}>
        <TabPane tab="政治谣言" key="0" />
        <TabPane tab="微博采集" key="1" />
        <TabPane tab="推特采集" key="2" />
        <TabPane tab="舆情报告" key="3" />
      </Tabs>
      {children}
    </>
  );
}
