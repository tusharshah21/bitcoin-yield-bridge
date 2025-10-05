use starknet::ContractAddress;

#[starknet::interface]
trait IAtomiqBridge<TContractState> {
    fn initiate_bitcoin_to_starknet_swap(
        ref self: TContractState,
        bitcoin_address: felt252,
        starknet_recipient: ContractAddress,
        amount_satoshi: u256,
        target_token: ContractAddress,
    ) -> felt252;

    fn get_swap_status(self: @TContractState, swap_id: felt252) -> u8;
    fn get_exchange_rate(self: @TContractState, from_token: felt252, to_token: ContractAddress) -> u256;
}