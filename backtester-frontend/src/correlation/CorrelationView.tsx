import Plot from 'react-plotly.js';
import React, { useState } from 'react';
import styled from 'styled-components';
import { CorrelationMatrix, CorrelationMatrixRequest } from '../types';
import { correlationController } from '../services/correlation/controller';

const FormContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const FormTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
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

const SuccessMessage = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #eefef3;
  border: 1px solid #cdfdda;
  border-radius: 6px;
  color: #00ff00;
  font-size: 14px;
`;

const ErrorMessage = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #ff0000;
  font-size: 14px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  padding: 10px 24px;
  background: ${props => props.disabled ? '#9ca3af' : '#cdfdda'};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;

  &:hover {
    background: ${props => props.disabled ? '#9ca3af' : '#2563eb'};
  }
`;

interface BaseFormData {
  symbols: string[];
  start_date: string;
  end_date: string;
}

interface CorrelationViewProps {
}

const CorrelationView: React.FC<CorrelationViewProps> = ({}) => {
  const [baseFormData, setBaseFormData] = useState<BaseFormData>({
    symbols: ['AAPL'],
    start_date: '2023-01-01',
    end_date: '2023-12-31',
  });
  const [symbolsInput, setSymbolsInput] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix | null>(null);

  const handleBaseFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'symbols') {
      setSymbolsInput(value);
      // Parse symbols, split by comma, trim whitespace, filter empty
      const upperCaseValue = value.toUpperCase();
      const parsedSymbols = upperCaseValue
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      setBaseFormData(prev => ({
        ...prev,
        symbols: parsedSymbols,
      }));
    } else {
      setBaseFormData(prev => ({
        ...prev,
        [name]: ['initial_capital', 'commission_pct', 'commission_fixed'].includes(name)
          ? parseFloat(value) || 0
          : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
	setCorrelationMatrix(null);

    try {
      const payload: CorrelationMatrixRequest = baseFormData;
      const matrix: CorrelationMatrix = await correlationController.getCorrelationMatrix(payload);
	  setCorrelationMatrix(matrix);
      setSuccess('Correlation matrix generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
	<>
		<FormContainer>
		<FormTitle>Correlation Matrix</FormTitle>

		{success && <SuccessMessage>{success}</SuccessMessage>}
		{error && <ErrorMessage>{error}</ErrorMessage>}

		<form onSubmit={handleSubmit}>
			<FormSection>
			<FormGrid>
				<FormField>
				<Label>Symbol(s)</Label>
				<Input
					type="text"
					name="symbols"
					value={symbolsInput}
					onChange={handleBaseFormChange}
					placeholder="AAPL,MSFT"
					required
				/>
				{/* Display parsed symbols as a list */}
				{baseFormData.symbols.length > 0 && (
					<div style={{ marginTop: '8px', fontSize: '13px', color: '#374151' }}>
					<strong>Parsed Symbols:</strong> {baseFormData.symbols.join(', ')}
					</div>
				)}
				</FormField>
				<FormField>
				<Label>Start Date</Label>
				<Input
					type="date"
					name="start_date"
					value={baseFormData.start_date}
					onChange={handleBaseFormChange}
					required
				/>
				</FormField>
				<FormField>
				<Label>End Date</Label>
				<Input
					type="date"
					name="end_date"
					value={baseFormData.end_date}
					onChange={handleBaseFormChange}
					required
				/>
				</FormField>
			</FormGrid>
			</FormSection>

			<ButtonContainer>
			<SubmitButton type="submit" disabled={loading}>
				{loading ? 'Running...' : 'Get Correlation Matrix'}
			</SubmitButton>
			</ButtonContainer>
		</form>
		</FormContainer>
		{correlationMatrix && (<Plot data={[{
			type: 'heatmap',
			z: Object.keys(correlationMatrix).map(row => Object.keys(correlationMatrix).map(col => correlationMatrix[row][col])),
			x: Object.keys(correlationMatrix),
			y: Object.keys(correlationMatrix),
			colorscale: 'RdBu',
			zmin: -1, zmax: 1
		}]} layout={{}} />)}
	</>
  );
};

export default CorrelationView;
