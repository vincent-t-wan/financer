export type StrategyType = 'sma_crossover' | 'ema_crossover';

export interface BaseStrategyConfig {
  type: StrategyType;
  name: string;
  description: string;
}

// SMA Crossover Strategy
export interface SMACrossoverConfig extends BaseStrategyConfig {
  type: 'sma_crossover';
  short_period: number;
  long_period: number;
}

// EMA Crossover Strategy
export interface EMACrossoverConfig extends BaseStrategyConfig {
  type: 'ema_crossover';
  short_period: number;
  long_period: number;
}

export type StrategyConfig = 
  | SMACrossoverConfig 
  | EMACrossoverConfig;

// Form field definition for dynamic rendering
export interface StrategyFormField {
  name: string;
  label: string;
  type: 'number' | 'text';
  defaultValue: number | string;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
}

export interface StrategyDefinition {
  type: StrategyType;
  name: string;
  description: string;
  fields: StrategyFormField[];
  getDefaultConfig: () => StrategyConfig;
}
