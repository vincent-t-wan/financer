import { 
  StrategyType, 
  StrategyConfig, 
  StrategyDefinition,
  SMACrossoverConfig,
  EMACrossoverConfig
} from '../types/strategy';
import { BacktestRequest } from '../types';

/**
 * Strategy Factory - Handles creation and configuration of different trading strategies
 */
export class StrategyFactory {
  private static strategies: Record<StrategyType, StrategyDefinition> = {
    sma_crossover: {
      type: 'sma_crossover',
      name: 'SMA Crossover',
      description: 'Buy when short SMA crosses above long SMA, sell when it crosses below',
      fields: [
        {
          name: 'short_period',
          label: 'Short SMA Period',
          type: 'number',
          defaultValue: 20,
          min: 2,
          max: 200,
          step: 1,
          helpText: 'Fast moving average period'
        },
        {
          name: 'long_period',
          label: 'Long SMA Period',
          type: 'number',
          defaultValue: 60,
          min: 10,
          max: 500,
          step: 1,
          helpText: 'Slow moving average period'
        }
      ],
      getDefaultConfig: (): SMACrossoverConfig => ({
        type: 'sma_crossover',
        name: 'SMA Crossover',
        description: 'Buy when short SMA crosses above long SMA',
        short_period: 20,
        long_period: 60
      })
    },

    ema_crossover: {
      type: 'ema_crossover',
      name: 'EMA Crossover',
      description: 'Buy when short EMA crosses above long EMA, sell when it crosses below',
      fields: [
        {
          name: 'short_period',
          label: 'Short EMA Period',
          type: 'number',
          defaultValue: 12,
          min: 2,
          max: 200,
          step: 1,
          helpText: 'Fast exponential moving average period'
        },
        {
          name: 'long_period',
          label: 'Long EMA Period',
          type: 'number',
          defaultValue: 26,
          min: 10,
          max: 500,
          step: 1,
          helpText: 'Slow exponential moving average period'
        }
      ],
      getDefaultConfig: (): EMACrossoverConfig => ({
        type: 'ema_crossover',
        name: 'EMA Crossover',
        description: 'Buy when short EMA crosses above long EMA',
        short_period: 12,
        long_period: 26
      })
    }
  };

  /**
   * Get all available strategies
   */
  static getAllStrategies(): StrategyDefinition[] {
    return Object.values(this.strategies);
  }

  /**
   * Get a specific strategy definition
   */
  static getStrategy(type: StrategyType): StrategyDefinition {
    return this.strategies[type];
  }

  /**
   * Get default configuration for a strategy
   */
  static getDefaultConfig(type: StrategyType): StrategyConfig {
    return this.strategies[type].getDefaultConfig();
  }

  /**
   * Convert strategy config to API request format
   */
  static toApiRequest(
    config: StrategyConfig,
    baseParams: {
      symbols: string[];
      start_date: string;
      end_date: string;
      initial_capital: number;
      commission_pct: number;
      commission_fixed: number;
    }
  ): BacktestRequest {
    const indicators = this.buildIndicators(config);
    const signalLogic = this.buildSignalLogic(config);

    return {
      ...baseParams,
      strategy_indicators: indicators,
      signal_logic: signalLogic
    };
  }

  /**
   * Build indicators object based on strategy config
   */
  private static buildIndicators(config: StrategyConfig): Record<string, any> {
    switch (config.type) {
      case 'sma_crossover':
        return {
          sma_short: { type: 'sma', window: config.short_period },
          sma_long: { type: 'sma', window: config.long_period }
        };

      case 'ema_crossover':
        return {
          ema_short: { type: 'ema', window: config.short_period },
          ema_long: { type: 'ema', window: config.long_period }
        };

      default:
        throw new Error(`Unknown strategy type: ${(config as any).type}`);
    }
  }

  /**
   * Build signal logic string based on strategy config
   */
  private static buildSignalLogic(config: StrategyConfig): string {
    switch (config.type) {
      case 'sma_crossover':
        return "1 if row['sma_short'] > row['sma_long'] else -1";

      case 'ema_crossover':
        return "1 if row['ema_short'] > row['ema_long'] else -1";

      default:
        throw new Error(`Unknown strategy type: ${(config as any).type}`);
    }
  }

  /**
   * Validate strategy configuration
   */
  static validateConfig(config: StrategyConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (config.type) {
      case 'sma_crossover':
      case 'ema_crossover':
        if (config.short_period >= config.long_period) {
          errors.push('Short period must be less than long period');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
