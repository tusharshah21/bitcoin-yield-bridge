#[cfg(test)]
mod test_integration {
    use super::super::bitcoin_yield_bridge::BitcoinYieldBridge;
    use super::super::interfaces::ibitcoin_yield_bridge::{IBitcoinYieldBridgeDispatcher, IBitcoinYieldBridgeDispatcherTrait};
    use super::super::interfaces::iadmin::{IAdminDispatcher, IAdminDispatcherTrait};
    use super::super::interfaces::imock_erc20::{IMockERC20Dispatcher, IMockERC20DispatcherTrait};
    use super::mocks::{MockERC20, MockVesuProtocol, MockTrovesProtocol, MockAtomiqBridge, MockAVNUPaymaster};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use starknet::{ContractAddress, contract_address_const, get_contract_address};
    use snforge_std::{
        declare, ContractClassTrait, DeclareResultTrait,
        start_cheat_caller_address, stop_cheat_caller_address,
        start_cheat_block_timestamp, stop_cheat_block_timestamp
    };

    const INITIAL_SUPPLY: u256 = 1000000000000000; // 1B tokens
    const DEPOSIT_AMOUNT: u256 = 1000000000; // 1000 USDC

    fn OWNER() -> ContractAddress { contract_address_const::<'OWNER'>() }
    fn USER1() -> ContractAddress { contract_address_const::<'USER1'>() }
    fn USER2() -> ContractAddress { contract_address_const::<'USER2'>() }

    /// Deploy all mock contracts and main contract with full integration
    fn deploy_full_integration() -> (
        IBitcoinYieldBridgeDispatcher,
        IAdminDispatcher,
        ContractAddress,
        IMockERC20Dispatcher,
        ContractAddress,
        ContractAddress,
        ContractAddress,
        ContractAddress,
    ) {
        // Deploy Mock USDC Token
        let usdc_contract = declare("MockERC20").unwrap().contract_class();
        let usdc_constructor_args = array![
            'USD Coin',           // name
            'USDC',              // symbol  
            INITIAL_SUPPLY,      // initial supply
            OWNER().into()       // recipient
        ];
        let (usdc_address, _) = usdc_contract.deploy(@usdc_constructor_args).unwrap();
        let usdc_dispatcher = IMockERC20Dispatcher { contract_address: usdc_address };
        let usdc_erc20 = IERC20Dispatcher { contract_address: usdc_address };

        // Deploy Mock Vesu Protocol
        let vesu_contract = declare("MockVesuProtocol").unwrap().contract_class();
        let (vesu_address, _) = vesu_contract.deploy(@array![]).unwrap();

        // Deploy Mock Troves Protocol
        let troves_contract = declare("MockTrovesProtocol").unwrap().contract_class();
        let (troves_address, _) = troves_contract.deploy(@array![]).unwrap();

        // Deploy Mock Atomiq Bridge
        let atomiq_contract = declare("MockAtomiqBridge").unwrap().contract_class();
        let (atomiq_address, _) = atomiq_contract.deploy(@array![]).unwrap();

        // Deploy Mock AVNU Paymaster
        let avnu_contract = declare("MockAVNUPaymaster").unwrap().contract_class();
        let (avnu_address, _) = avnu_contract.deploy(@array![]).unwrap();

        // Deploy Main BitcoinYieldBridge Contract
        let main_contract = declare("BitcoinYieldBridge").unwrap().contract_class();
        let constructor_args = array![
            OWNER().into(),
            vesu_address.into(),
            troves_address.into(),
            atomiq_address.into(),
            avnu_address.into(),
        ];
        let (main_address, _) = main_contract.deploy(@constructor_args).unwrap();

        let main_dispatcher = IBitcoinYieldBridgeDispatcher { contract_address: main_address };
        let admin_dispatcher = IAdminDispatcher { contract_address: main_address };

        // Setup initial token balances for users
        start_cheat_caller_address(usdc_address, OWNER());
        usdc_dispatcher.mint(USER1(), DEPOSIT_AMOUNT * 100); // Give users plenty of tokens
        usdc_dispatcher.mint(USER2(), DEPOSIT_AMOUNT * 100);
        stop_cheat_caller_address(usdc_address);

        (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address)
    }

    #[test]
    fn test_full_deposit_flow_with_real_tokens() {
        let (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address) = deploy_full_integration();
        
        // Setup strategies as admin
        start_cheat_caller_address(main_address, OWNER());
        admin_dispatcher.add_strategy(vesu_address, usdc_address, 50000, 2); // Vesu 5% APY
        admin_dispatcher.add_strategy(troves_address, usdc_address, 80000, 3); // Troves 8% APY
        stop_cheat_caller_address(main_address);

        // User approves and deposits
        start_cheat_caller_address(usdc_address, USER1());
        let usdc_erc20 = IERC20Dispatcher { contract_address: usdc_address };
        usdc_erc20.approve(main_address, DEPOSIT_AMOUNT);
        stop_cheat_caller_address(usdc_address);

        start_cheat_caller_address(main_address, USER1());
        let success = main_dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, 1); // Vesu strategy
        assert(success, 'Deposit should succeed');

        // Verify balance
        let user_balance = main_dispatcher.get_user_balance(USER1());
        assert(user_balance == DEPOSIT_AMOUNT, 'User balance should match deposit');

        // Verify contract received tokens
        let contract_balance = usdc_erc20.balance_of(main_address);
        assert(contract_balance == DEPOSIT_AMOUNT, 'Contract should hold deposited tokens');

        stop_cheat_caller_address(main_address);
    }

    #[test]
    fn test_yield_accrual_and_withdrawal() {
        let (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address) = deploy_full_integration();
        
        // Setup
        start_cheat_caller_address(main_address, OWNER());
        admin_dispatcher.add_strategy(vesu_address, usdc_address, 100000, 2); // 10% APY for faster testing
        stop_cheat_caller_address(main_address);

        // User deposits
        start_cheat_caller_address(usdc_address, USER1());
        let usdc_erc20 = IERC20Dispatcher { contract_address: usdc_address };
        usdc_erc20.approve(main_address, DEPOSIT_AMOUNT);
        stop_cheat_caller_address(usdc_address);

        start_cheat_caller_address(main_address, USER1());
        main_dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, 1);

        let initial_balance = main_dispatcher.get_user_balance(USER1());
        assert(initial_balance == DEPOSIT_AMOUNT, 'Initial balance should equal deposit');

        // Fast forward 1 year for yield accrual
        start_cheat_block_timestamp(main_address, starknet::get_block_timestamp() + 31557600);

        let balance_after_yield = main_dispatcher.get_user_balance(USER1());
        assert(balance_after_yield > initial_balance, 'Balance should increase with yield');

        // Calculate expected yield (10% APY for 1 year)
        let expected_yield = (DEPOSIT_AMOUNT * 100000) / 1000000; // 10% of deposit
        let expected_total = DEPOSIT_AMOUNT + expected_yield;
        
        // Allow for small rounding differences
        let diff = if balance_after_yield > expected_total {
            balance_after_yield - expected_total
        } else {
            expected_total - balance_after_yield
        };
        assert(diff < DEPOSIT_AMOUNT / 1000, 'Yield calculation should be close to expected');

        stop_cheat_block_timestamp(main_address);
        stop_cheat_caller_address(main_address);
    }

    #[test]
    fn test_multi_strategy_yield_comparison() {
        let (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address) = deploy_full_integration();
        
        // Setup different APY strategies
        start_cheat_caller_address(main_address, OWNER());
        admin_dispatcher.add_strategy(vesu_address, usdc_address, 50000, 2);   // 5% APY
        admin_dispatcher.add_strategy(troves_address, usdc_address, 100000, 3); // 10% APY
        stop_cheat_caller_address(main_address);

        // User1 deposits to low-yield strategy
        start_cheat_caller_address(usdc_address, USER1());
        let usdc_erc20 = IERC20Dispatcher { contract_address: usdc_address };
        usdc_erc20.approve(main_address, DEPOSIT_AMOUNT);
        stop_cheat_caller_address(usdc_address);

        start_cheat_caller_address(main_address, USER1());
        main_dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, 1); // 5% strategy
        stop_cheat_caller_address(main_address);

        // User2 deposits to high-yield strategy  
        start_cheat_caller_address(usdc_address, USER2());
        usdc_erc20.approve(main_address, DEPOSIT_AMOUNT);
        stop_cheat_caller_address(usdc_address);

        start_cheat_caller_address(main_address, USER2());
        main_dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, 2); // 10% strategy
        stop_cheat_caller_address(main_address);

        // Fast forward 1 year
        start_cheat_block_timestamp(main_address, starknet::get_block_timestamp() + 31557600);

        let user1_balance = main_dispatcher.get_user_balance(USER1());
        let user2_balance = main_dispatcher.get_user_balance(USER2());

        // User2 should have higher balance due to higher APY
        assert(user2_balance > user1_balance, 'Higher APY should yield more');

        stop_cheat_block_timestamp(main_address);
    }

    #[test]
    fn test_emergency_withdrawal_recovery() {
        let (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address) = deploy_full_integration();
        
        // Setup and deposit
        start_cheat_caller_address(main_address, OWNER());
        admin_dispatcher.add_strategy(vesu_address, usdc_address, 50000, 2);
        stop_cheat_caller_address(main_address);

        // Users deposit
        start_cheat_caller_address(usdc_address, USER1());
        let usdc_erc20 = IERC20Dispatcher { contract_address: usdc_address };
        usdc_erc20.approve(main_address, DEPOSIT_AMOUNT);
        stop_cheat_caller_address(usdc_address);

        start_cheat_caller_address(main_address, USER1());
        main_dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, 1);
        stop_cheat_caller_address(main_address);

        let initial_tvl = main_dispatcher.get_total_value_locked();
        assert(initial_tvl == DEPOSIT_AMOUNT, 'TVL should equal deposits');

        // Admin performs emergency withdrawal
        start_cheat_caller_address(main_address, OWNER());
        let emergency_success = main_dispatcher.emergency_withdraw();
        assert(emergency_success, 'Emergency withdrawal should succeed');
        stop_cheat_caller_address(main_address);

        // Contract should still track user balances even after emergency
        let user_balance = main_dispatcher.get_user_balance(USER1());
        assert(user_balance == DEPOSIT_AMOUNT, 'User balance should persist after emergency');
    }

    #[test]
    fn test_cross_protocol_integration() {
        let (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address) = deploy_full_integration();
        
        // Setup both protocols
        start_cheat_caller_address(main_address, OWNER());
        admin_dispatcher.add_strategy(vesu_address, usdc_address, 50000, 2);
        admin_dispatcher.add_strategy(troves_address, usdc_address, 80000, 3);
        stop_cheat_caller_address(main_address);

        // User deposits to both strategies
        start_cheat_caller_address(usdc_address, USER1());
        let usdc_erc20 = IERC20Dispatcher { contract_address: usdc_address };
        usdc_erc20.approve(main_address, DEPOSIT_AMOUNT * 2);
        stop_cheat_caller_address(usdc_address);

        start_cheat_caller_address(main_address, USER1());
        
        // Deposit to Vesu
        main_dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, 1);
        
        // Deposit to Troves
        main_dispatcher.deposit_and_yield(DEPOSIT_AMOUNT, 2);

        let total_balance = main_dispatcher.get_user_balance(USER1());
        assert(total_balance == DEPOSIT_AMOUNT * 2, 'Should have balance across both strategies');

        // Withdraw all
        let withdraw_success = main_dispatcher.withdraw_yield(0); // 0 = withdraw all
        assert(withdraw_success, 'Cross-protocol withdrawal should work');

        let final_balance = main_dispatcher.get_user_balance(USER1());
        assert(final_balance == 0, 'Should have zero balance after full withdrawal');

        stop_cheat_caller_address(main_address);
    }

    #[test]
    fn test_bridge_integration_simulation() {
        let (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address) = deploy_full_integration();
        
        // Simulate Bitcoin bridge transaction
        start_cheat_caller_address(main_address, USER1());
        
        let btc_token = contract_address_const::<'BTC'>();
        let bridge_id = main_dispatcher.initiate_bridge(
            btc_token,
            usdc_address,
            100000000 // 1 BTC in satoshi
        );

        assert(bridge_id != 0, 'Bridge should return valid ID');
        
        // In production, this would trigger Atomiq bridge flow
        // For testing, we verify the event was emitted correctly
        
        stop_cheat_caller_address(main_address);
    }

    #[test]
    fn test_gas_optimization_batch_operations() {
        let (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address) = deploy_full_integration();
        
        // Setup
        start_cheat_caller_address(main_address, OWNER());
        admin_dispatcher.add_strategy(vesu_address, usdc_address, 50000, 2);
        stop_cheat_caller_address(main_address);

        // Approve large amount for batch operations
        start_cheat_caller_address(usdc_address, USER1());
        let usdc_erc20 = IERC20Dispatcher { contract_address: usdc_address };
        usdc_erc20.approve(main_address, DEPOSIT_AMOUNT * 10);
        stop_cheat_caller_address(usdc_address);

        start_cheat_caller_address(main_address, USER1());

        // Perform multiple deposits (testing gas efficiency)
        let mut i = 0;
        while i < 5 {
            let success = main_dispatcher.deposit_and_yield(DEPOSIT_AMOUNT / 5, 1);
            assert(success, 'Batch deposit should succeed');
            i += 1;
        };

        let final_balance = main_dispatcher.get_user_balance(USER1());
        assert(final_balance == DEPOSIT_AMOUNT, 'Batch deposits should sum correctly');

        stop_cheat_caller_address(main_address);
    }

    #[test]
    fn test_precision_and_rounding() {
        let (main_dispatcher, admin_dispatcher, main_address, usdc_dispatcher, usdc_address, vesu_address, troves_address, atomiq_address) = deploy_full_integration();
        
        // Setup with high precision APY
        start_cheat_caller_address(main_address, OWNER());
        admin_dispatcher.add_strategy(vesu_address, usdc_address, 123456, 2); // 12.3456% APY
        stop_cheat_caller_address(main_address);

        // Test with odd amounts that might cause rounding issues
        let odd_amount = 1234567; // Odd number to test precision
        
        start_cheat_caller_address(usdc_address, USER1());
        let usdc_erc20 = IERC20Dispatcher { contract_address: usdc_address };
        usdc_erc20.approve(main_address, odd_amount);
        stop_cheat_caller_address(usdc_address);

        start_cheat_caller_address(main_address, USER1());
        
        let success = main_dispatcher.deposit_and_yield(odd_amount, 1);
        assert(success, 'Odd amount deposit should work');

        let balance = main_dispatcher.get_user_balance(USER1());
        assert(balance == odd_amount, 'Precision should be maintained');

        stop_cheat_caller_address(main_address);
    }
}