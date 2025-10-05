#[cfg(test)]
mod test_comprehensive {
    use super::super::bitcoin_yield_bridge::BitcoinYieldBridge;
    use super::super::interfaces::ibitcoin_yield_bridge::{IBitcoinYieldBridgeDispatcher, IBitcoinYieldBridgeDispatcherTrait};
    use super::super::interfaces::iadmin::{IAdminDispatcher, IAdminDispatcherTrait};
    use starknet::{ContractAddress, contract_address_const, get_contract_address, get_block_timestamp};
    use snforge_std::{
        declare, ContractClassTrait, DeclareResultTrait, 
        start_cheat_caller_address, stop_cheat_caller_address,
        start_cheat_block_timestamp, stop_cheat_block_timestamp,
        spy_events, SpyOn, EventSpy, EventAssertions
    };

    // Test Constants
    fn OWNER() -> ContractAddress { contract_address_const::<'OWNER'>() }
    fn USER1() -> ContractAddress { contract_address_const::<'USER1'>() }
    fn USER2() -> ContractAddress { contract_address_const::<'USER2'>() }
    fn USDC_TOKEN() -> ContractAddress { contract_address_const::<'USDC'>() }
    fn VESU_PROTOCOL() -> ContractAddress { contract_address_const::<'VESU'>() }
    fn TROVES_PROTOCOL() -> ContractAddress { contract_address_const::<'TROVES'>() }
    fn ATOMIQ_BRIDGE() -> ContractAddress { contract_address_const::<'ATOMIQ'>() }
    fn AVNU_PAYMASTER() -> ContractAddress { contract_address_const::<'AVNU'>() }

    const DEPOSIT_AMOUNT: u256 = 1000000000; // 1000 USDC (6 decimals)
    const SMALL_DEPOSIT: u256 = 100000000;   // 100 USDC
    const STRATEGY_VESU: u8 = 1;
    const STRATEGY_TROVES: u8 = 2;

    /// Deploy contract with default parameters
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

    /// Setup contract with initial strategies
    fn setup_with_strategies() -> (IBitcoinYieldBridgeDispatcher, IAdminDispatcher, ContractAddress) {
        let (dispatcher, admin_dispatcher, contract_address) = deploy_contract();
        
        start_cheat_caller_address(contract_address, OWNER());
        
        // Add Vesu lending strategy (5% APY, low risk)
        admin_dispatcher.add_strategy(
            VESU_PROTOCOL(),
            USDC_TOKEN(),
            50000, // 5% APY
            2      // Low risk
        );
        
        // Add Troves aggregation strategy (8% APY, medium risk)
        admin_dispatcher.add_strategy(
            TROVES_PROTOCOL(),
            USDC_TOKEN(),
            80000, // 8% APY  
            3      // Medium risk
        );
        
        stop_cheat_caller_address(contract_address);
        
        (dispatcher, admin_dispatcher, contract_address)
    }

    // ============ UNIT TESTS ============

    #[test]
    fn test_deployment_and_initialization() {
        let (dispatcher, _, _) = deploy_contract();
        
        assert(dispatcher.get_strategy_count() == 0, 'Initial strategy count wrong');
        assert(dispatcher.get_total_value_locked() == 0, 'Initial TVL wrong');
        assert(dispatcher.get_total_yield() == 0, 'Initial yield wrong');
    }

    #[test]
    fn test_deposit_and_yield_success() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        let mut spy = spy_events(SpyOn::One(contract_address));
        
        start_cheat_caller_address(contract_address, USER1());
        
        // Mock USDC approval and balance
        // In real tests, you'd deploy mock ERC20 contract
        
        let success = dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        assert(success, 'Deposit should succeed');
        
        // Check user balance
        let balance = dispatcher.get_user_balance(USER1());
        assert(balance == DEPOSIT_AMOUNT, 'User balance incorrect');
        
        // Check TVL update
        assert(dispatcher.get_total_value_locked() == DEPOSIT_AMOUNT, 'TVL not updated');
        
        // Verify event emission
        spy.assert_emitted(@array![
            (contract_address, BitcoinYieldBridge::Event::DepositMade(
                BitcoinYieldBridge::DepositMade {
                    user: USER1(),
                    token: USDC_TOKEN(),
                    amount: DEPOSIT_AMOUNT,
                    strategy_id: 1,
                    timestamp: get_block_timestamp()
                }
            ))
        ]);
        
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    fn test_withdraw_yield_success() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        // First deposit
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        
        // Simulate time passage for yield accrual
        start_cheat_block_timestamp(contract_address, get_block_timestamp() + 31557600); // 1 year
        
        let initial_balance = dispatcher.get_user_balance(USER1());
        
        // Withdraw half
        let success = dispatcher.withdraw_yield(DEPOSIT_AMOUNT / 2);
        assert(success, 'Withdrawal should succeed');
        
        let remaining_balance = dispatcher.get_user_balance(USER1());
        assert(remaining_balance < initial_balance, 'Balance should decrease');
        
        stop_cheat_block_timestamp(contract_address);
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    fn test_withdraw_all() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        
        // Withdraw all (amount = 0)
        let success = dispatcher.withdraw_yield(0);
        assert(success, 'Withdraw all should succeed');
        
        let remaining_balance = dispatcher.get_user_balance(USER1());
        assert(remaining_balance == 0, 'Should have zero balance');
        
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    fn test_multiple_strategy_deposits() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        
        // Deposit to Vesu strategy
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        
        // Deposit to Troves strategy
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_TROVES);
        
        let total_balance = dispatcher.get_user_balance(USER1());
        assert(total_balance == DEPOSIT_AMOUNT * 2, 'Multi-strategy balance wrong');
        
        stop_cheat_caller_address(contract_address);
    }

    // ============ INTEGRATION TESTS ============

    #[test]
    fn test_multi_user_interactions() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        // User1 deposits
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        stop_cheat_caller_address(contract_address);
        
        // User2 deposits
        start_cheat_caller_address(contract_address, USER2());
        dispatcher.deposit_and_yield(SMALL_DEPOSIT, STRATEGY_TROVES);
        stop_cheat_caller_address(contract_address);
        
        // Check individual balances
        assert(dispatcher.get_user_balance(USER1()) == DEPOSIT_AMOUNT, 'User1 balance wrong');
        assert(dispatcher.get_user_balance(USER2()) == SMALL_DEPOSIT, 'User2 balance wrong');
        
        // Check total TVL
        let expected_tvl = DEPOSIT_AMOUNT + SMALL_DEPOSIT;
        assert(dispatcher.get_total_value_locked() == expected_tvl, 'Total TVL wrong');
    }

    #[test]
    fn test_yield_calculation_over_time() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        
        let initial_balance = dispatcher.get_user_balance(USER1());
        
        // Fast forward 6 months
        start_cheat_block_timestamp(contract_address, get_block_timestamp() + 15778800);
        
        let balance_after_6months = dispatcher.get_user_balance(USER1());
        
        // Fast forward to 1 year
        start_cheat_block_timestamp(contract_address, get_block_timestamp() + 31557600);
        
        let balance_after_1year = dispatcher.get_user_balance(USER1());
        
        // Yield should increase over time
        assert(balance_after_6months > initial_balance, 'No yield after 6 months');
        assert(balance_after_1year > balance_after_6months, 'No additional yield');
        
        stop_cheat_block_timestamp(contract_address);
        stop_cheat_caller_address(contract_address);
    }

    // ============ SECURITY TESTS ============

    #[test]
    #[should_panic(expected: ('Amount must be greater than 0',))]
    fn test_deposit_zero_amount() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.deposit_and_yield(0, STRATEGY_VESU);
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    #[should_panic(expected: ('Invalid strategy ID',))]
    fn test_deposit_invalid_strategy() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, 5); // Invalid strategy
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    #[should_panic(expected: ('No balance to withdraw',))]
    fn test_withdraw_no_balance() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.withdraw_yield(DEPOSIT_AMOUNT); // No prior deposit
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    #[should_panic(expected: ('Insufficient balance',))]
    fn test_withdraw_insufficient_balance() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.deposit_and_yield(SMALL_DEPOSIT, STRATEGY_VESU);
        
        // Try to withdraw more than deposited
        dispatcher.withdraw_yield(DEPOSIT_AMOUNT);
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    #[should_panic(expected: ('Caller is not the owner',))]
    fn test_unauthorized_emergency_withdraw() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1()); // Not owner
        dispatcher.emergency_withdraw();
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    fn test_emergency_withdraw_authorized() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        // Add some deposits first
        start_cheat_caller_address(contract_address, USER1());
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        stop_cheat_caller_address(contract_address);
        
        // Emergency withdraw as owner
        start_cheat_caller_address(contract_address, OWNER());
        let success = dispatcher.emergency_withdraw();
        assert(success, 'Emergency withdraw should succeed');
        stop_cheat_caller_address(contract_address);
    }

    // ============ ACCOUNT ABSTRACTION TESTS ============

    #[test]
    fn test_gasless_transaction_simulation() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        // Simulate gasless transaction through AVNU paymaster
        start_cheat_caller_address(contract_address, USER1());
        
        // In production, this would check AVNU paymaster integration
        let success = dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        assert(success, 'Gasless transaction should work');
        
        stop_cheat_caller_address(contract_address);
    }

    // ============ PERFORMANCE BENCHMARKS ============

    #[test]
    fn test_gas_optimization_multiple_operations() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        
        // Perform multiple operations to test gas efficiency
        let mut i = 0;
        while i < 10 {
            dispatcher.deposit_and_yield(SMALL_DEPOSIT, STRATEGY_VESU);
            i += 1;
        };
        
        // Check final state
        let balance = dispatcher.get_user_balance(USER1());
        assert(balance == SMALL_DEPOSIT * 10, 'Batch operations failed');
        
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    fn test_large_amount_handling() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        
        // Test with very large amount (1M USDC)
        let large_amount = 1000000000000; // 1M USDC
        let success = dispatcher.deposit_and_yield(large_amount, STRATEGY_VESU);
        assert(success, 'Large amount deposit failed');
        
        let balance = dispatcher.get_user_balance(USER1());
        assert(balance == large_amount, 'Large amount balance wrong');
        
        stop_cheat_caller_address(contract_address);
    }

    // ============ EVENT TESTING ============

    #[test]
    fn test_event_emissions() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        let mut spy = spy_events(SpyOn::One(contract_address));
        
        start_cheat_caller_address(contract_address, USER1());
        
        // Deposit
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        
        // Withdraw
        dispatcher.withdraw_yield(DEPOSIT_AMOUNT / 2);
        
        // Should have emitted DepositMade and WithdrawalMade events
        let events = spy.get_events();
        assert(events.events.len() >= 2, 'Should emit multiple events');
        
        stop_cheat_caller_address(contract_address);
    }

    // ============ EDGE CASES ============

    #[test]
    fn test_dust_amounts() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        
        // Test with minimum amount (1 wei equivalent)
        let success = dispatcher.deposit_and_yield(1, STRATEGY_VESU);
        assert(success, 'Dust amount should work');
        
        let balance = dispatcher.get_user_balance(USER1());
        assert(balance >= 1, 'Dust balance should be tracked');
        
        stop_cheat_caller_address(contract_address);
    }

    #[test]
    fn test_strategy_switching() {
        let (dispatcher, _, contract_address) = setup_with_strategies();
        
        start_cheat_caller_address(contract_address, USER1());
        
        // Deposit to first strategy
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_VESU);
        
        // Withdraw all
        dispatcher.withdraw_yield(0);
        
        // Deposit to second strategy
        dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, STRATEGY_TROVES);
        
        let balance = dispatcher.get_user_balance(USER1());
        assert(balance == DEPOSIT_AMOUNT, 'Strategy switch failed');
        
        stop_cheat_caller_address(contract_address);
    }
}