import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BacktestForm from './components/BacktestForm';
import BacktestHistory from './components/BacktestHistory';
import { BacktestRun } from './types';
import { backtestController } from './services/backtester/controller';
import './App.css';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 16px 24px;
`;

const HeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
`;

const HeaderSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
`;

const TabContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  margin-top: 24px;
`;

const TabNav = styled.nav`
  display: flex;
  gap: 32px;
  border-bottom: 1px solid #e5e7eb;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 12px 4px;
  border: none;
  background: none;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#cdfdda' : '#6b7280'};
  border-bottom: 2px solid ${props => props.active ? '#cdfdda' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${props => props.active ? '#cdfdda' : '#1f2937'};
    border-bottom-color: ${props => props.active ? '#cdfdda' : '#d1d5db'};
  }
`;

const Content = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
`;

type Tab = 'run' | 'history';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('run');
  const [backtests, setBacktests] = useState<BacktestRun[]>([]);

  useEffect(() => {
    fetchBacktests();
  }, []);

  const fetchBacktests = async () => {
    try {
      const data = await backtestController.getAllBacktests();
      setBacktests(data);
    } catch (error) {
      console.error('Error fetching backtests:', error);
    }
  };

  return (
    <AppContainer>
      <Header>
        <HeaderContent>
          <HeaderTitle>Backtester Dashboard</HeaderTitle>
          <HeaderSubtitle>Run and analyze trading strategy backtests</HeaderSubtitle>
        </HeaderContent>
      </Header>

      <TabContainer>
        <TabNav>
          <TabButton active={activeTab === 'run'} onClick={() => setActiveTab('run')}>
            Run Backtest
          </TabButton>
          <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>
            History ({backtests.length})
          </TabButton>
        </TabNav>
      </TabContainer>

      <Content>
        {activeTab === 'run' && <BacktestForm/>}
        {activeTab === 'history' && (
          <BacktestHistory backtests={backtests} onRefresh={fetchBacktests} />
        )}
      </Content>
    </AppContainer>
  );
};

export default App;
