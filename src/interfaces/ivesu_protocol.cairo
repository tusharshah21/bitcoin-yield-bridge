use starknet::ContractAddress;

#[starknet::interface]
trait IVesuProtocol<TContractState> {
    fn supply(
        ref self: TContractState,
        asset: ContractAddress,
        amount: u256,
        on_behalf_of: ContractAddress,
    );

    fn withdraw(
        ref self: TContractState,
        asset: ContractAddress,
        amount: u256,
        to: ContractAddress,
    ) -> u256;

    fn get_supply_apy(self: @TContractState, asset: ContractAddress) -> u256;
    fn get_user_supply_balance(self: @TContractState, user: ContractAddress, asset: ContractAddress) -> u256;
}