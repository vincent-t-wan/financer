import React, { useState } from 'react';
import styled from 'styled-components';
import { BacktestRun } from '../types';
import BacktestDetails from './BacktestDetails';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
`;

const RefreshButton = styled.button`
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: #f9fafb;
`;

const Th = styled.th`
  padding: 12px 24px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Tbody = styled.tbody`
  background: white;
`;

const Tr = styled.tr`
  border-top: 1px solid #f3f4f6;
  transition: background 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const Td = styled.td`
  padding: 16px 24px;
  font-size: 14px;
  color: #1f2937;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'completed': return '#d1fae5';
      case 'failed': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#065f46';
      case 'failed': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const ViewButton = styled.button`
  color: #cdfdda;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #1e40af;
  }
`;

const ReturnValue = styled.span<{ positive: boolean }>`
  color: ${props => props.positive ? '#059669' : '#dc2626'};
  font-weight: 500;
`;

interface BacktestHistoryProps {
  backtests: BacktestRun[];
  onRefresh: () => Promise<void>;
}

const BacktestHistory: React.FC<BacktestHistoryProps> = ({ backtests, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestRun | null>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
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

  const refresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
  }

  return (
    <Container>
      <Header>
        <Title>Backtest History</Title>
          <RefreshButton onClick={refresh} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
      </Header>

      <TableContainer>
        <Table>
          <Thead>
            <tr>
              <Th>ID</Th>
              <Th>Symbols</Th>
              <Th>Period</Th>
              <Th>Final Value</Th>
              <Th>Total Return</Th>
              <Th>Sharpe Ratio</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {backtests.map((backtest) => (
              <Tr key={backtest.id}>
                <Td>#{backtest.id}</Td>
                <Td>{backtest.symbols}</Td>
                <Td>
                  {formatDate(backtest.start_date)} - {formatDate(backtest.end_date)}
                </Td>
                <Td>{formatCurrency(backtest.final_portfolio_value)}</Td>
                <Td>
                  <ReturnValue positive={parseFloat(backtest.total_return) > 0}>
                    {formatPercent(backtest.total_return)}
                  </ReturnValue>
                </Td>
                <Td>{parseFloat(backtest.sharpe_ratio).toFixed(2)}</Td>
                <Td>
                  <StatusBadge status={backtest.status}>
                    {backtest.status}
                  </StatusBadge>
                </Td>
                <Td>{formatDateTime(backtest.created_at)}</Td>
                <Td>
                  <ViewButton onClick={() => setSelectedBacktest(backtest)}>
                    View Details
                  </ViewButton>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {selectedBacktest && (
        <BacktestDetails
          backtest={selectedBacktest}
          onClose={() => setSelectedBacktest(null)}
        />
      )}
    </Container>
  );
};

export default BacktestHistory;
