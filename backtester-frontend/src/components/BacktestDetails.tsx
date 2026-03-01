import React from 'react';
import styled from 'styled-components';
import { BacktestRun } from '../types';
import EquityGraph from './graphs/EquityGraph';
import PortfolioValueGraph from './graphs/PortfolioValueGraph';
import DailyReturnsGraph from './graphs/DailyReturnsGraph';
import DrawdownGraph from './graphs/DrawdownGraph';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
`;

const Modal = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
`;

const CloseButton = styled.button`
  color: #9ca3af;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #6b7280;
  }
`;

const ModalContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FieldLabel = styled.p`
  font-size: 14px;
  color: #6b7280;
`;

const FieldValue = styled.p`
  font-weight: 500;
  color: #1f2937;
`;

const MetricCard = styled.div<{ variant?: string }>`
  padding: 16px;
  border-radius: 8px;
  background: ${props => {
    switch (props.variant) {
      case 'blue': return '#eff6ff';
      case 'green': return '#d1fae5';
      case 'red': return '#fee2e2';
      default: return '#f9fafb';
    }
  }};
`;

const MetricLabel = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const MetricValue = styled.p<{ color?: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => {
    switch (props.color) {
      case 'blue': return '#1e40af';
      case 'green': return '#059669';
      case 'red': return '#dc2626';
      default: return '#1f2937';
    }
  }};
`;

const CodeBlock = styled.pre`
  background: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  overflow-x: auto;
`;

interface Props {
  backtest: BacktestRun;
  onClose: () => void;
}

const BacktestDetails: React.FC<Props> = ({ backtest, onClose }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(value));
  };

  const formatPercent = (value: string): string => {
    return (parseFloat(value) * 100).toFixed(2) + '%';
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Backtest #{backtest.id}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalContent>
          {/* Configuration */}
          <Section>
            <SectionTitle>Configuration</SectionTitle>
            <Grid>
              <Field>
                <FieldLabel>Symbols</FieldLabel>
                <FieldValue>{backtest.symbols}</FieldValue>
              </Field>
              <Field>
                <FieldLabel>Period</FieldLabel>
                <FieldValue>
                  {formatDate(backtest.start_date)} - {formatDate(backtest.end_date)}
                </FieldValue>
              </Field>
              <Field>
                <FieldLabel>Initial Capital</FieldLabel>
                <FieldValue>{formatCurrency(backtest.initial_capital)}</FieldValue>
              </Field>
              <Field>
                <FieldLabel>Commission</FieldLabel>
                <FieldValue>
                  {formatPercent(backtest.commission_pct)} + ${backtest.commission_fixed}
                </FieldValue>
              </Field>
            </Grid>
          </Section>

          {/* Performance Metrics */}
          <Section>
            <SectionTitle>Performance</SectionTitle>
            <Grid>
              <MetricCard variant="blue">
                <MetricLabel>Final Portfolio Value</MetricLabel>
                <MetricValue color="blue">
                  {formatCurrency(backtest.final_portfolio_value)}
                </MetricValue>
              </MetricCard>
              <MetricCard variant={parseFloat(backtest.total_return) > 0 ? 'green' : 'red'}>
                <MetricLabel>Total Return</MetricLabel>
                <MetricValue color={parseFloat(backtest.total_return) > 0 ? 'green' : 'red'}>
                  {formatPercent(backtest.total_return)}
                </MetricValue>
              </MetricCard>
            </Grid>
            <Grid>
              <Field>
                <FieldLabel>Annualized Return</FieldLabel>
                <FieldValue>{formatPercent(backtest.annualized_return)}</FieldValue>
              </Field>
              <Field>
                <FieldLabel>Annualized Volatility</FieldLabel>
                <FieldValue>{formatPercent(backtest.annualized_volatility)}</FieldValue>
              </Field>
              <Field>
                <FieldLabel>Sharpe Ratio</FieldLabel>
                <FieldValue>{parseFloat(backtest.sharpe_ratio).toFixed(2)}</FieldValue>
              </Field>
              <Field>
                <FieldLabel>Sortino Ratio</FieldLabel>
                <FieldValue>{parseFloat(backtest.sortino_ratio).toFixed(2)}</FieldValue>
              </Field>
              <Field>
                <FieldLabel>Maximum Drawdown</FieldLabel>
                <FieldValue style={{ color: '#dc2626' }}>
                  {formatPercent(backtest.max_drawdown)}
                </FieldValue>
              </Field>
            </Grid>
          </Section>

          {/* Strategy Config */}
          <Section>
            <SectionTitle>Strategy Configuration</SectionTitle>
            <CodeBlock>
              {JSON.stringify(backtest.strategy_config, null, 2)}
            </CodeBlock>
          </Section>

          {/* Graphs */}
          <Section>
            <SectionTitle>Graphs</SectionTitle>
            <PortfolioValueGraph data={backtest.portfolio_values} />
            <DailyReturnsGraph data={backtest.daily_returns} />
            <DrawdownGraph data={backtest.drawdown_curve} />
            <EquityGraph data={backtest.equity_curve} />
          </Section>
        </ModalContent>
      </Modal>
    </Overlay>
  );
};

export default BacktestDetails;
