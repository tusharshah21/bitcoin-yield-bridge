use starknet::ContractAddress;

#[starknet::interface]
trait ITrovesProtocol<TContractState> {
    fn deposit_for_yield(
        ref self: TContractState,
        token: ContractAddress,
        amount: u256,
        strategy_type: u8,
    ) -> u256;

    fn withdraw_with_yield(
        ref self: TContractState,
        receipt_token: ContractAddress,
        amount: u256,
    ) -> u256;

    fn get_optimal_strategy(self: @TContractState, token: ContractAddress) -> u8;
    fn get_strategy_apy(self: @TContractState, token: ContractAddress, strategy_type: u8) -> u256;
}