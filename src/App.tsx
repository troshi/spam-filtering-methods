import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined,
  FunctionOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { TFIDFVisualizer } from './components/methods/tf-idf';
import { DifferentialEvolutionVisualizer } from './components/methods/differential-evolution';

const { Header, Sider, Content, Footer } = Layout;

/** Mapa de key del menú al componente correspondiente */
const VIEWS: Record<string, React.ReactNode> = {
  '1': <TFIDFVisualizer />,
  '2': <DifferentialEvolutionVisualizer />,
  '3': <div style={{ padding: '2rem', color: '#9CA3AF' }}>Próximamente…</div>,
};

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState('1');

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const currentYear = new Date().getFullYear();

  return (
    // height: 100vh hace que el layout ocupe toda la ventana
    <Layout style={{ height: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => setSelectedKey(key)}
          items={[
            {
              key: '1',
              icon: <ReadOutlined />,
              label: 'TF-IDF',
            },
            {
              key: '2',
              icon: <FunctionOutlined />,
              label: 'Evolución Diferencial',
            },
            {
              key: '3',
              icon: <ProfileOutlined />,
              label: 'nav 3',
            },
          ]}
        />
      </Sider>

      {/* Layout interno: header + content + footer apilados verticalmente */}
      <Layout style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header style={{ padding: 0, background: colorBgContainer, flexShrink: 0 }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
        </Header>

        {/* overflow: auto permite scroll interno sin que la página entera crezca */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            flex: 1,
            overflow: 'auto',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {VIEWS[selectedKey]}
        </Content>

        <Footer style={{ textAlign: 'center', flexShrink: 0 }}>
          Spam Filtering Methods Comparative ©{currentYear} Created by Josimar Medina
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;

