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

  const handeChangeTabs = key => {
    setCurrentTabIndex(key);

    if (key === '0') {
      history.replace('/')
    }

    if (key === '1') {
      history.replace('/public-sentiment-report')
    }
  };

  return (
    <>
      <Tabs
        onChange={handeChangeTabs}
        defaultActiveKey={currentTabIndex}
      >
        <TabPane tab="推特采集" key="0" />
        <TabPane tab="舆情报告" key="1" />
      </Tabs>
      {children}
    </>
  );
}
