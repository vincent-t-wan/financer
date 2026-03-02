import { CorrelationMatrixRequest, CorrelationMatrix } from '../../types';

const API_BASE_URL = 'http://localhost:8000/correlation';

export const correlationController = {
  async getCorrelationMatrix(data: CorrelationMatrixRequest): Promise<CorrelationMatrix> {
	const response = await fetch(`${API_BASE_URL}/get_matrix/`, {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify(data),
	});
	
	if (!response.ok) {
	  const errorData = await response.json();
	  throw new Error(errorData.error || 'Failed to retrieve correlation matrix');
	}
	
	return response.json();
  },
};
