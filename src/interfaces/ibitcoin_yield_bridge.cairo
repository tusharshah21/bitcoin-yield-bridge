use starknet::ContractAddress;

#[derive(Drop, Copy, Serde, starknet::Store)]
struct UserPosition {
    strategy_id: u256,
    deposit_amount: u256,
    shares: u256,
    last_interaction: u64,
    accumulated_yield: u256,
}

#[derive(Drop, Copy, Serde, starknet::Store)]
struct YieldStrategy {
    id: u256,
    protocol: ContractAddress,
    token: ContractAddress,
    apy: u256,
    total_deposits: u256,
    is_active: bool,
    risk_level: u8,
}

/// Main interface for BitcoinYieldBridge contract
/// Handles Bitcoin-to-Starknet DeFi aggregation with Lightning support
#[starknet::interface]
trait IBitcoinYieldBridge<TContractState> {
    /// Deposit tokens and automatically allocate to yield strategy
    /// @param amount: Amount to deposit (in token decimals)
    /// @param strategy_id: Strategy to use (1=Vesu lending, 2=Troves aggregation)
    /// @return success: Boolean indicating successful deposit
    fn deposit_and_yield(ref self: TContractState, amount: u256, strategy_id: u8) -> bool;

    /// Withdraw principal + accumulated yield
    /// @param amount: Amount to withdraw (0 = withdraw all)
    /// @return success: Boolean indicating successful withdrawal
    fn withdraw_yield(ref self: TContractState, amount: u256) -> bool;

    /// Get user's total balance across all strategies
    /// @param user: User address to check
    /// @return balance: Total balance including principal + yield
    fn get_user_balance(self: @TContractState, user: ContractAddress) -> u256;

    /// Get total yield generated across all strategies
    /// @return yield: Total yield in USDC equivalent
    fn get_total_yield(self: @TContractState) -> u256;

    /// Emergency withdrawal (admin only) - extracts all funds
    /// @return success: Boolean indicating successful emergency withdrawal
    fn emergency_withdraw(ref self: TContractState) -> bool;

    // Additional functions for full functionality
    fn initiate_bridge(
        ref self: TContractState,
        from_token: ContractAddress,
        to_token: ContractAddress,
        amount: u256,
    ) -> felt252;

    fn get_user_position(
        self: @TContractState,
        user: ContractAddress,
        strategy_id: u256,
    ) -> UserPosition;

    fn get_strategy(
        self: @TContractState,
        strategy_id: u256,
    ) -> YieldStrategy;

    fn get_total_value_locked(self: @TContractState) -> u256;
    fn get_strategy_count(self: @TContractState) -> u256;
}