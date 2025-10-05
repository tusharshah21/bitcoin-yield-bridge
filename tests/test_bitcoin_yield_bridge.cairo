#[cfg(test)]
mod test_bitcoin_yield_bridge {
    use super::super::bitcoin_yield_bridge::BitcoinYieldBridge;
    use super::super::interfaces::ibitcoin_yield_bridge::{IBitcoinYieldBridgeDispatcher, IBitcoinYieldBridgeDispatcherTrait};
    use super::super::interfaces::iadmin::{IAdminDispatcher, IAdminDispatcherTrait};
    use starknet::{ContractAddress, contract_address_const, get_contract_address};
    use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address, stop_cheat_caller_address};

    fn OWNER() -> ContractAddress {
        contract_address_const::<'OWNER'>()
    }

    fn USER() -> ContractAddress {
        contract_address_const::<'USER'>()
    }

    fn TOKEN() -> ContractAddress {
        contract_address_const::<'TOKEN'>()
    }

    fn VESU_PROTOCOL() -> ContractAddress {
        contract_address_const::<'VESU'>()
    }

    fn TROVES_PROTOCOL() -> ContractAddress {
        contract_address_const::<'TROVES'>()
    }

    fn ATOMIQ_BRIDGE() -> ContractAddress {
        contract_address_const::<'ATOMIQ'>()
    }

    fn AVNU_PAYMASTER() -> ContractAddress {
        contract_address_const::<'AVNU'>()
    }

    fn deploy_contract() -> (IBitcoinYieldBridgeDispatcher, IAdminDispatcher, ContractAddress) {
        let contract = declare("BitcoinYieldBridge").unwrap().contract_class();
        
        let constructor_args = array![
            OWNER().into(),
            VESU_PROTOCOL().into(),
            TROVES_PROTOCOL().into(),
            ATOMIQ_BRIDGE().into(),
            AVNU_PAYMASTER().into(),
        ];

        let (contract_address, _) = contract.deploy(@constructor_args).unwrap();
        
        let dispatcher = IBitcoinYieldBridgeDispatcher { contract_address };
        let admin_dispatcher = IAdminDispatcher { contract_address };
        
        (dispatcher, admin_dispatcher, contract_address)
    }

    #[test]
    fn test_deployment() {
        let (dispatcher, _, contract_address) = deploy_contract();
        
        assert(dispatcher.get_strategy_count() == 0, 'Initial strategy count should be 0');
        assert(dispatcher.get_total_value_locked() == 0, 'Initial TVL should be 0');
    }

    #[test]
    fn test_add_strategy() {
        let (dispatcher, admin_dispatcher, contract_address) = deploy_contract();
        
        start_cheat_caller_address(contract_address, OWNER());
        
        let strategy_id = admin_dispatcher.add_strategy(
            VESU_PROTOCOL(),
            TOKEN(),
            50000, // 5% APY (with 6 decimal precision)
            2, // Low risk
        );
        
        stop_cheat_caller_address(contract_address);
        
        assert(strategy_id == 1, 'First strategy ID should be 1');
        assert(dispatcher.get_strategy_count() == 1, 'Strategy count should be 1');
        
        let strategy = dispatcher.get_strategy(strategy_id);
        assert(strategy.protocol == VESU_PROTOCOL(), 'Protocol address mismatch');
        assert(strategy.token == TOKEN(), 'Token address mismatch');
        assert(strategy.apy == 50000, 'APY mismatch');
        assert(strategy.risk_level == 2, 'Risk level mismatch');
        assert(strategy.is_active == true, 'Strategy should be active');
    }

    #[test]
    fn test_bridge_initiation() {
        let (dispatcher, admin_dispatcher, contract_address) = deploy_contract();
        
        start_cheat_caller_address(contract_address, USER());
        
        let bridge_id = dispatcher.initiate_bridge(
            TOKEN(),
            contract_address_const::<'WBTC'>(),
            1000000, // 1 BTC in satoshi
        );
        
        stop_cheat_caller_address(contract_address);
        
        assert(bridge_id != 0, 'Bridge ID should not be zero');
    }

    #[test]
    fn test_user_position_initial_state() {
        let (dispatcher, _, _) = deploy_contract();
        
        let position = dispatcher.get_user_position(USER(), 1);
        
        assert(position.strategy_id == 0, 'Initial strategy ID should be 0');
        assert(position.deposit_amount == 0, 'Initial deposit should be 0');
        assert(position.shares == 0, 'Initial shares should be 0');
        assert(position.accumulated_yield == 0, 'Initial yield should be 0');
    }

    #[test]
    #[should_panic(expected: ('Caller is not the owner',))]
    fn test_unauthorized_strategy_addition() {
        let (_, admin_dispatcher, contract_address) = deploy_contract();
        
        start_cheat_caller_address(contract_address, USER()); // Not owner
        
        admin_dispatcher.add_strategy(
            VESU_PROTOCOL(),
            TOKEN(),
            50000,
            2,
        );
        
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    fn test_emergency_pause() {
        let (_, admin_dispatcher, contract_address) = deploy_contract();
        
        start_cheat_caller_address(contract_address, OWNER());
        
        admin_dispatcher.emergency_pause();
        
        stop_cheat_caller_address(contract_address);
        
        // Test that paused state prevents operations would go here
        // For now, we just test that the function executes without error
    }
}