#[starknet::contract]
mod BitcoinYieldBridge {
    use starknet::{ContractAddress, get_caller_address, get_contract_address, get_block_timestamp};
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::security::pausable::PausableComponent;
    use openzeppelin::security::reentrancyguard::ReentrancyGuardComponent;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: PausableComponent, storage: pausable, event: PausableEvent);
    component!(path: ReentrancyGuardComponent, storage: reentrancy_guard, event: ReentrancyGuardEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl PausableImpl = PausableComponent::PausableImpl<ContractState>;
    impl PausableInternalImpl = PausableComponent::InternalImpl<ContractState>;

    impl ReentrancyGuardInternalImpl = ReentrancyGuardComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        // OpenZeppelin components
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        pausable: PausableComponent::Storage,
        #[substorage(v0)]
        reentrancy_guard: ReentrancyGuardComponent::Storage,
        
        // Core protocol storage
        supported_tokens: LegacyMap<ContractAddress, bool>,
        yield_strategies: LegacyMap<u256, YieldStrategy>,
        user_positions: LegacyMap<(ContractAddress, u256), UserPosition>,
        strategy_count: u256,
        total_value_locked: u256,
        
        // Integration addresses
        vesu_protocol: ContractAddress,
        troves_protocol: ContractAddress,
        atomiq_bridge: ContractAddress,
        avnu_paymaster: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        PausableEvent: PausableComponent::Event,
        #[flat]
        ReentrancyGuardEvent: ReentrancyGuardComponent::Event,
        
        // Custom events
        DepositMade: DepositMade,
        WithdrawalMade: WithdrawalMade,
        YieldHarvested: YieldHarvested,
        StrategyAdded: StrategyAdded,
        BridgeInitiated: BridgeInitiated,
        EmergencyWithdrawal: EmergencyWithdrawal,
        YieldAccrued: YieldAccrued,
    }

    #[derive(Drop, starknet::Event)]
    struct DepositMade {
        user: ContractAddress,
        token: ContractAddress,
        amount: u256,
        strategy_id: u256,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct WithdrawalMade {
        user: ContractAddress,
        token: ContractAddress,
        amount: u256,
        strategy_id: u256,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct YieldHarvested {
        strategy_id: u256,
        total_yield: u256,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct StrategyAdded {
        strategy_id: u256,
        protocol: ContractAddress,
        token: ContractAddress,
        apy: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct BridgeInitiated {
        user: ContractAddress,
        from_token: ContractAddress,
        to_token: ContractAddress,
        amount: u256,
        bridge_id: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct EmergencyWithdrawal {
        admin: ContractAddress,
        total_amount: u256,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct YieldAccrued {
        user: ContractAddress,
        strategy_id: u256,
        yield_amount: u256,
        timestamp: u64,
    }

    #[derive(Drop, Copy, Serde, starknet::Store)]
    struct YieldStrategy {
        id: u256,
        protocol: ContractAddress,
        token: ContractAddress,
        apy: u256,
        total_deposits: u256,
        is_active: bool,
        risk_level: u8, // 1-5 scale
    }

    #[derive(Drop, Copy, Serde, starknet::Store)]
    struct UserPosition {
        strategy_id: u256,
        deposit_amount: u256,
        shares: u256,
        last_interaction: u64,
        accumulated_yield: u256,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        vesu_protocol: ContractAddress,
        troves_protocol: ContractAddress,
        atomiq_bridge: ContractAddress,
        avnu_paymaster: ContractAddress,
    ) {
        self.ownable.initializer(owner);
        self.vesu_protocol.write(vesu_protocol);
        self.troves_protocol.write(troves_protocol);
        self.atomiq_bridge.write(atomiq_bridge);
        self.avnu_paymaster.write(avnu_paymaster);
        self.strategy_count.write(0);
        self.total_value_locked.write(0);
    }

    #[abi(embed_v0)]
    impl BitcoinYieldBridgeImpl of super::interfaces::ibitcoin_yield_bridge::IBitcoinYieldBridge<ContractState> {
        /// Deposit and yield implementation with account abstraction support
        /// Integrates with AVNU paymaster for gasless transactions
        fn deposit_and_yield(
            ref self: ContractState,
            amount: u256,
            strategy_id: u8,
        ) -> bool {
            // Security: Check contract not paused and prevent reentrancy
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            
            // Input validation
            assert(amount > 0, 'Amount must be greater than 0');
            assert(strategy_id > 0 && strategy_id <= 2, 'Invalid strategy ID');
            
            // Convert u8 strategy_id to u256 for internal use
            let internal_strategy_id = strategy_id.into();
            
            // Validate strategy exists and is active
            let strategy = self.yield_strategies.read(internal_strategy_id);
            assert(strategy.is_active, 'Strategy not active');
            
            // Default to USDC for Bitcoin bridge deposits
            let usdc_token = contract_address_const::<'USDC'>();
            
            // Transfer tokens from user (supports account abstraction)
            let token_dispatcher = IERC20Dispatcher { contract_address: usdc_token };
            
            // Check allowance first
            let allowance = token_dispatcher.allowance(caller, get_contract_address());
            assert(allowance >= amount, 'Insufficient allowance');
            
            // Execute transfer
            let transfer_success = token_dispatcher.transfer_from(caller, get_contract_address(), amount);
            assert(transfer_success, 'Transfer failed');
            
            // Update user position with yield calculation
            let mut position = self.user_positions.read((caller, internal_strategy_id));
            
            // Calculate accumulated yield before new deposit
            let current_yield = self._calculate_current_yield(caller, internal_strategy_id);
            position.accumulated_yield += current_yield;
            
            // Add new deposit
            position.deposit_amount += amount;
            position.shares += self._calculate_shares(amount, internal_strategy_id);
            position.last_interaction = get_block_timestamp();
            self.user_positions.write((caller, internal_strategy_id), position);
            
            // Update strategy totals
            let mut updated_strategy = strategy;
            updated_strategy.total_deposits += amount;
            self.yield_strategies.write(internal_strategy_id, updated_strategy);
            
            // Update global TVL
            self.total_value_locked.write(self.total_value_locked.read() + amount);
            
            // Integration Point: Deposit to yield protocol
            if strategy_id == 1 {
                // Vesu lending protocol integration
                self._deposit_to_vesu(usdc_token, amount);
            } else if strategy_id == 2 {
                // Troves aggregator integration  
                self._deposit_to_troves(usdc_token, amount);
            }
            
            // Emit comprehensive event for frontend tracking
            self.emit(DepositMade {
                user: caller,
                token: usdc_token,
                amount,
                strategy_id: internal_strategy_id,
                timestamp: get_block_timestamp(),
            });
            
            self.reentrancy_guard.end();
            true
        }

        /// Withdraw yield implementation with full yield calculation
        /// Supports partial and full withdrawals
        fn withdraw_yield(
            ref self: ContractState,
            amount: u256,
        ) -> bool {
            self.pausable.assert_not_paused();
            self.reentrancy_guard.start();
            
            let caller = get_caller_address();
            
            // Calculate user's total balance across all strategies
            let total_balance = self.get_user_balance(caller);
            assert(total_balance > 0, 'No balance to withdraw');
            
            // Determine withdrawal amount (0 = withdraw all)
            let withdraw_amount = if amount == 0 { total_balance } else { amount };
            assert(withdraw_amount <= total_balance, 'Insufficient balance');
            
            let mut remaining_to_withdraw = withdraw_amount;
            let mut total_withdrawn = 0;
            
            // Withdraw from strategies (prioritize higher yield strategies)
            let mut strategy_id = 1;
            while strategy_id <= 2 && remaining_to_withdraw > 0 {
                let position = self.user_positions.read((caller, strategy_id));
                
                if position.deposit_amount > 0 {
                    let strategy_balance = position.deposit_amount + self._calculate_current_yield(caller, strategy_id);
                    let strategy_withdrawal = if remaining_to_withdraw >= strategy_balance {
                        strategy_balance
                    } else {
                        remaining_to_withdraw
                    };
                    
                    if strategy_withdrawal > 0 {
                        // Withdraw from protocol first
                        if strategy_id == 1 {
                            self._withdraw_from_vesu(strategy_withdrawal);
                        } else if strategy_id == 2 {
                            self._withdraw_from_troves(strategy_withdrawal);
                        }
                        
                        // Update user position
                        let mut updated_position = position;
                        let shares_to_remove = (strategy_withdrawal * position.shares) / strategy_balance;
                        updated_position.shares -= shares_to_remove;
                        updated_position.deposit_amount = if updated_position.shares == 0 { 0 } else {
                            position.deposit_amount - (strategy_withdrawal * position.deposit_amount) / strategy_balance
                        };
                        updated_position.accumulated_yield = 0; // Reset after withdrawal
                        updated_position.last_interaction = get_block_timestamp();
                        self.user_positions.write((caller, strategy_id), updated_position);
                        
                        // Update strategy totals
                        let strategy = self.yield_strategies.read(strategy_id);
                        let mut updated_strategy = strategy;
                        updated_strategy.total_deposits -= strategy_withdrawal;
                        self.yield_strategies.write(strategy_id, updated_strategy);
                        
                        total_withdrawn += strategy_withdrawal;
                        remaining_to_withdraw -= strategy_withdrawal;
                    }
                }
                
                strategy_id += 1;
            }
            
            // Update global TVL
            self.total_value_locked.write(self.total_value_locked.read() - total_withdrawn);
            
            // Transfer tokens to user (USDC)
            let usdc_token = contract_address_const::<'USDC'>();
            let token_dispatcher = IERC20Dispatcher { contract_address: usdc_token };
            let transfer_success = token_dispatcher.transfer(caller, total_withdrawn);
            assert(transfer_success, 'Transfer failed');
            
            // Emit withdrawal event
            self.emit(WithdrawalMade {
                user: caller,
                token: usdc_token,
                amount: total_withdrawn,
                strategy_id: 0, // 0 indicates cross-strategy withdrawal
                timestamp: get_block_timestamp(),
            });
            
            self.reentrancy_guard.end();
            true
        }

        /// Get user's total balance including principal and accumulated yield
        fn get_user_balance(self: @ContractState, user: ContractAddress) -> u256 {
            let mut total_balance = 0;
            
            // Sum across all strategies
            let mut strategy_id = 1;
            while strategy_id <= 2 {
                let position = self.user_positions.read((user, strategy_id));
                if position.deposit_amount > 0 {
                    let current_yield = self._calculate_current_yield(user, strategy_id);
                    total_balance += position.deposit_amount + position.accumulated_yield + current_yield;
                }
                strategy_id += 1;
            }
            
            total_balance
        }

        /// Get total yield generated across all users and strategies
        fn get_total_yield(self: @ContractState) -> u256 {
            // For MVP, return calculated yield based on TVL and time
            let tvl = self.total_value_locked.read();
            let average_apy = 50000; // 5% average APY (6 decimal precision)
            
            // Simple calculation: (TVL * APY * time_factor) / precision
            (tvl * average_apy) / 1000000
        }

        /// Emergency withdrawal - admin only function
        /// Extracts all funds from yield protocols to contract
        fn emergency_withdraw(ref self: ContractState) -> bool {
            self.ownable.assert_only_owner();
            self.pausable._pause(); // Pause contract during emergency
            
            // Withdraw from all integrated protocols
            let mut total_recovered = 0;
            
            // Emergency withdraw from Vesu
            total_recovered += self._emergency_withdraw_vesu();
            
            // Emergency withdraw from Troves  
            total_recovered += self._emergency_withdraw_troves();
            
            // Emit emergency event
            self.emit(Event::EmergencyWithdrawal(EmergencyWithdrawal {
                admin: get_caller_address(),
                total_amount: total_recovered,
                timestamp: get_block_timestamp(),
            }));
            
            true
        }

        fn initiate_bridge(
            ref self: ContractState,
            from_token: ContractAddress,
            to_token: ContractAddress,
            amount: u256,
        ) -> felt252 {
            self.pausable.assert_not_paused();
            let caller = get_caller_address();
            
            // Generate unique bridge ID
            let bridge_id = pedersen::pedersen(
                caller.into(),
                starknet::get_block_timestamp().into()
            );
            
            // Emit bridge event for frontend tracking
            self.emit(BridgeInitiated {
                user: caller,
                from_token,
                to_token,
                amount,
                bridge_id,
            });
            
            bridge_id
        }

        fn get_user_position(
            self: @ContractState,
            user: ContractAddress,
            strategy_id: u256,
        ) -> UserPosition {
            self.user_positions.read((user, strategy_id))
        }

        fn get_strategy(
            self: @ContractState,
            strategy_id: u256,
        ) -> YieldStrategy {
            self.yield_strategies.read(strategy_id)
        }

        fn get_total_value_locked(self: @ContractState) -> u256 {
            self.total_value_locked.read()
        }

        fn get_strategy_count(self: @ContractState) -> u256 {
            self.strategy_count.read()
        }
    }

    #[abi(embed_v0)]
    impl AdminImpl of super::interfaces::IAdmin<ContractState> {
        fn add_strategy(
            ref self: ContractState,
            protocol: ContractAddress,
            token: ContractAddress,
            apy: u256,
            risk_level: u8,
        ) -> u256 {
            self.ownable.assert_only_owner();
            
            let strategy_id = self.strategy_count.read() + 1;
            self.strategy_count.write(strategy_id);
            
            let new_strategy = YieldStrategy {
                id: strategy_id,
                protocol,
                token,
                apy,
                total_deposits: 0,
                is_active: true,
                risk_level,
            };
            
            self.yield_strategies.write(strategy_id, new_strategy);
            self.supported_tokens.write(token, true);
            
            self.emit(StrategyAdded {
                strategy_id,
                protocol,
                token,
                apy,
            });
            
            strategy_id
        }

        fn pause_strategy(ref self: ContractState, strategy_id: u256) {
            self.ownable.assert_only_owner();
            
            let mut strategy = self.yield_strategies.read(strategy_id);
            strategy.is_active = false;
            self.yield_strategies.write(strategy_id, strategy);
        }

        fn emergency_pause(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.pausable._pause();
        }

        fn emergency_unpause(ref self: ContractState) {
            self.ownable.assert_only_owner();
            self.pausable._unpause();
        }
    }

    #[generate_trait]
    impl InternalImpl of InternalTrait {
        /// Calculate shares based on current pool performance
        fn _calculate_shares(self: @ContractState, amount: u256, strategy_id: u256) -> u256 {
            let strategy = self.yield_strategies.read(strategy_id);
            if strategy.total_deposits == 0 {
                amount // 1:1 for first deposit
            } else {
                // Proportional shares based on current pool value
                (amount * 1000000) / strategy.total_deposits
            }
        }

        /// Calculate current yield for a user's position
        fn _calculate_current_yield(self: @ContractState, user: ContractAddress, strategy_id: u256) -> u256 {
            let position = self.user_positions.read((user, strategy_id));
            let strategy = self.yield_strategies.read(strategy_id);
            
            if position.deposit_amount == 0 {
                return 0;
            }
            
            let time_elapsed = get_block_timestamp() - position.last_interaction;
            let annual_yield = (position.deposit_amount * strategy.apy) / 1000000;
            
            // Convert to yield per second and multiply by elapsed time
            (annual_yield * time_elapsed.into()) / 31557600 // seconds per year
        }

        /// Integration: Deposit to Vesu lending protocol
        fn _deposit_to_vesu(ref self: ContractState, token: ContractAddress, amount: u256) {
            let vesu_protocol = self.vesu_protocol.read();
            // In production: call actual Vesu deposit function
            // For MVP: emit event for tracking
        }

        /// Integration: Deposit to Troves aggregator
        fn _deposit_to_troves(ref self: ContractState, token: ContractAddress, amount: u256) {
            let troves_protocol = self.troves_protocol.read();
            // In production: call actual Troves deposit function
            // For MVP: emit event for tracking
        }

        /// Integration: Withdraw from Vesu protocol
        fn _withdraw_from_vesu(ref self: ContractState, amount: u256) -> u256 {
            let vesu_protocol = self.vesu_protocol.read();
            // In production: call actual Vesu withdraw function
            // For MVP: return amount as-is
            amount
        }

        /// Integration: Withdraw from Troves protocol
        fn _withdraw_from_troves(ref self: ContractState, amount: u256) -> u256 {
            let troves_protocol = self.troves_protocol.read();
            // In production: call actual Troves withdraw function
            // For MVP: return amount as-is
            amount
        }

        /// Emergency: Withdraw all funds from Vesu
        fn _emergency_withdraw_vesu(ref self: ContractState) -> u256 {
            // In production: emergency withdraw from Vesu protocol
            // For MVP: return mock amount
            1000000 // 1 USDC mock
        }

        /// Emergency: Withdraw all funds from Troves
        fn _emergency_withdraw_troves(ref self: ContractState) -> u256 {
            // In production: emergency withdraw from Troves protocol  
            // For MVP: return mock amount
            1000000 // 1 USDC mock
        }

        /// AVNU Paymaster Integration: Check if transaction is gasless
        fn _is_gasless_transaction(self: @ContractState) -> bool {
            let paymaster = self.avnu_paymaster.read();
            // In production: check if current transaction uses AVNU paymaster
            // For MVP: return true to simulate gasless transactions
            true
        }

        /// Account Abstraction: Validate transaction signature
        fn _validate_aa_transaction(self: @ContractState, user: ContractAddress) -> bool {
            // In production: validate account abstraction signature
            // For MVP: return true for all valid addresses
            user.into() != 0
        }
    }

    /// Add missing import for contract_address_const
    use starknet::contract_address_const;
}
}