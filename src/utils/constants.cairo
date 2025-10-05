// Protocol constants

// Decimal precision
const PRECISION: u256 = 1000000; // 6 decimals
const BPS_PRECISION: u256 = 10000; // Basis points precision

// Risk levels
const RISK_VERY_LOW: u8 = 1;
const RISK_LOW: u8 = 2;
const RISK_MEDIUM: u8 = 3;
const RISK_HIGH: u8 = 4;
const RISK_VERY_HIGH: u8 = 5;

// Strategy types
const STRATEGY_LENDING: u8 = 1;
const STRATEGY_LIQUIDITY_PROVIDING: u8 = 2;
const STRATEGY_STAKING: u8 = 3;
const STRATEGY_YIELD_FARMING: u8 = 4;

// Maximum values for safety
const MAX_STRATEGY_COUNT: u256 = 100;
const MAX_USER_POSITIONS: u256 = 50;
const MAX_SLIPPAGE_BPS: u256 = 500; // 5% maximum slippage

// Time constants
const SECONDS_PER_YEAR: u256 = 31557600; // 365.25 days
const SECONDS_PER_DAY: u256 = 86400;

// Bridge status
const BRIDGE_PENDING: u8 = 0;
const BRIDGE_PROCESSING: u8 = 1;
const BRIDGE_COMPLETED: u8 = 2;
const BRIDGE_FAILED: u8 = 3;

// Minimum amounts (in wei/satoshi)
const MIN_DEPOSIT_AMOUNT: u256 = 1000000; // Minimum deposit
const MIN_WITHDRAWAL_AMOUNT: u256 = 1000000; // Minimum withdrawal