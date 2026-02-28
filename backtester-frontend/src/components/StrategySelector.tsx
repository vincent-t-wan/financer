import React from 'react';
import styled from 'styled-components';
import { StrategyType } from '../types/strategy';
import { StrategyFactory } from '../services/StrategyFactory';

const Container = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #cdfdda;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const StrategyCard = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid #cdfdda;
`;

const StrategyName = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
`;

const StrategyDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
`;

interface Props {
  selectedStrategy: StrategyType;
  onStrategyChange: (strategy: StrategyType) => void;
}

const StrategySelector: React.FC<Props> = ({ selectedStrategy, onStrategyChange }) => {
  const strategies = StrategyFactory.getAllStrategies();
  const currentStrategy = StrategyFactory.getStrategy(selectedStrategy);

  return (
    <Container>
      <Label>Select Strategy</Label>
      <Select 
        value={selectedStrategy} 
        onChange={(e) => onStrategyChange(e.target.value as StrategyType)}
      >
        {strategies.map((strategy) => (
          <option key={strategy.type} value={strategy.type}>
            {strategy.name}
          </option>
        ))}
      </Select>

      <StrategyCard>
        <StrategyName>{currentStrategy.name}</StrategyName>
        <StrategyDescription>{currentStrategy.description}</StrategyDescription>
      </StrategyCard>
    </Container>
  );
};

export default StrategySelector;
