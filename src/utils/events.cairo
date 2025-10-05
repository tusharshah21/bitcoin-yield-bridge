use starknet::ContractAddress;

// Event utilities for consistent event emission

#[derive(Drop, starknet::Event)]
struct ProtocolEvent {
    event_type: felt252,
    user: ContractAddress,
    amount: u256,
    timestamp: u64,
    data: Span<felt252>,
}

#[derive(Drop, starknet::Event)]
struct YieldEvent {
    strategy_id: u256,
    user: ContractAddress,
    yield_amount: u256,
    apy: u256,
    timestamp: u64,
}

#[derive(Drop, starknet::Event)]
struct BridgeEvent {
    bridge_id: felt252,
    user: ContractAddress,
    from_chain: felt252,
    to_chain: felt252,
    amount: u256,
    status: u8,
    timestamp: u64,
}

#[derive(Drop, starknet::Event)]
struct RiskEvent {
    strategy_id: u256,
    old_risk_level: u8,
    new_risk_level: u8,
    reason: felt252,
    timestamp: u64,
}