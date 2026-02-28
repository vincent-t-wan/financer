import React from 'react';
import styled from 'styled-components';
import { StrategyConfig, StrategyFormField } from '../types/strategy';
import { StrategyFactory } from '../services/StrategyFactory';

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #cdfdda;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const HelpText = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
`;

const ValidationError = styled.p`
  margin-top: 8px;
  font-size: 14px;
  color: #dc2626;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
`;

interface Props {
  config: StrategyConfig;
  onChange: (config: StrategyConfig) => void;
}

const DynamicStrategyForm: React.FC<Props> = ({ config, onChange }) => {
  const strategy = StrategyFactory.getStrategy(config.type);
  const validation = StrategyFactory.validateConfig(config);

  const handleFieldChange = (fieldName: string, value: number) => {
    onChange({
      ...config,
      [fieldName]: value
    } as StrategyConfig);
  };

  return (
    <div>
      <FormGrid>
        {strategy.fields.map((field) => (
          <FormField key={field.name}>
            <Label>{field.label}</Label>
            <Input
              type={field.type}
              value={(config as any)[field.name]}
              onChange={(e) => handleFieldChange(field.name, parseFloat(e.target.value) || 0)}
              min={field.min}
              max={field.max}
              step={field.step}
              required
            />
            {field.helpText && <HelpText>{field.helpText}</HelpText>}
          </FormField>
        ))}
      </FormGrid>

      {!validation.valid && (
        <div>
          {validation.errors.map((error, index) => (
            <ValidationError key={index}>{error}</ValidationError>
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicStrategyForm;
