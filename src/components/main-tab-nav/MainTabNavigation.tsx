import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { TFIDFVisualizer } from '../methods/tf-idf';
import { DifferentialEvolutionVisualizer } from '../methods/differential-evolution';

const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: 'TF-IDF',
    children: <TFIDFVisualizer />,
  },
  {
    key: '2',
    label: 'Evolución Diferencial',
    children: <DifferentialEvolutionVisualizer />,
  },
  {
    key: '3',
    label: 'Tab 3',
    children: 'Content of Tab Pane 3',
  },
];

const MainTabNavigation: React.FC = () => <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;

export default MainTabNavigation;
