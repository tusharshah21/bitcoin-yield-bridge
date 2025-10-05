use starknet::ContractAddress;

#[starknet::interface]
trait IAdmin<TContractState> {
    fn add_strategy(
        ref self: TContractState,
        protocol: ContractAddress,
        token: ContractAddress,
        apy: u256,
        risk_level: u8,
    ) -> u256;

    fn pause_strategy(ref self: TContractState, strategy_id: u256);
    fn emergency_pause(ref self: TContractState);
    fn emergency_unpause(ref self: TContractState);
}