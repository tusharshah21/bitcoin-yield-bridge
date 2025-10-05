use starknet::ContractAddress;

#[starknet::interface]
trait IAVNUPaymaster<TContractState> {
    fn is_transaction_sponsored(self: @TContractState, user: ContractAddress) -> bool;
    fn sponsor_transaction(ref self: TContractState, user: ContractAddress, gas_amount: u256) -> bool;
    fn get_supported_tokens(self: @TContractState) -> Span<ContractAddress>;
}