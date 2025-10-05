#[cfg(test)]
mod mocks {
    use starknet::ContractAddress;

    /// Mock AVNU Paymaster Contract for Testing
    #[starknet::contract]
    mod MockAVNUPaymaster {
        use starknet::{ContractAddress, get_caller_address};

        #[storage]
        struct Storage {
            supported_tokens: LegacyMap<ContractAddress, bool>,
            gas_sponsorship_enabled: bool,
        }

        #[constructor]
        fn constructor(ref self: ContractState) {
            self.gas_sponsorship_enabled.write(true);
        }

        #[abi(embed_v0)]
        impl MockAVNUPaymasterImpl of super::super::super::interfaces::iavnu_paymaster::IAVNUPaymaster<ContractState> {
            fn is_transaction_sponsored(self: @ContractState, user: ContractAddress) -> bool {
                self.gas_sponsorship_enabled.read()
            }

            fn sponsor_transaction(ref self: ContractState, user: ContractAddress, gas_amount: u256) -> bool {
                true // Mock successful sponsorship
            }

            fn get_supported_tokens(self: @ContractState) -> Span<ContractAddress> {
                array![].span() // Mock empty for testing
            }
        }
    }

    /// Mock Vesu Protocol for Testing
    #[starknet::contract]
    mod MockVesuProtocol {
        use starknet::ContractAddress;
        use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

        #[storage]
        struct Storage {
            user_supplies: LegacyMap<(ContractAddress, ContractAddress), u256>,
            supply_rates: LegacyMap<ContractAddress, u256>,
        }

        #[constructor]
        fn constructor(ref self: ContractState) {
            // Set mock APY rates
            let usdc = starknet::contract_address_const::<'USDC'>();
            self.supply_rates.write(usdc, 50000); // 5% APY
        }

        #[abi(embed_v0)]
        impl MockVesuProtocolImpl of super::super::super::interfaces::ivesu_protocol::IVesuProtocol<ContractState> {
            fn supply(
                ref self: ContractState,
                asset: ContractAddress,
                amount: u256,
                on_behalf_of: ContractAddress,
            ) {
                let current_supply = self.user_supplies.read((on_behalf_of, asset));
                self.user_supplies.write((on_behalf_of, asset), current_supply + amount);
            }

            fn withdraw(
                ref self: ContractState,
                asset: ContractAddress,
                amount: u256,
                to: ContractAddress,
            ) -> u256 {
                let current_supply = self.user_supplies.read((to, asset));
                assert(current_supply >= amount, 'Insufficient supply');
                
                self.user_supplies.write((to, asset), current_supply - amount);
                amount
            }

            fn get_supply_apy(self: @ContractState, asset: ContractAddress) -> u256 {
                self.supply_rates.read(asset)
            }

            fn get_user_supply_balance(
                self: @ContractState,
                user: ContractAddress,
                asset: ContractAddress
            ) -> u256 {
                self.user_supplies.read((user, asset))
            }
        }
    }

    /// Mock Troves Protocol for Testing
    #[starknet::contract]
    mod MockTrovesProtocol {
        use starknet::ContractAddress;

        #[storage]
        struct Storage {
            user_positions: LegacyMap<(ContractAddress, ContractAddress), u256>,
            strategy_apys: LegacyMap<(ContractAddress, u8), u256>,
        }

        #[constructor]
        fn constructor(ref self: ContractState) {
            let usdc = starknet::contract_address_const::<'USDC'>();
            self.strategy_apys.write((usdc, 1), 80000); // 8% APY for strategy 1
        }

        #[abi(embed_v0)]
        impl MockTrovesProtocolImpl of super::super::super::interfaces::itroves_protocol::ITrovesProtocol<ContractState> {
            fn deposit_for_yield(
                ref self: ContractState,
                token: ContractAddress,
                amount: u256,
                strategy_type: u8,
            ) -> u256 {
                let current_position = self.user_positions.read((starknet::get_caller_address(), token));
                self.user_positions.write((starknet::get_caller_address(), token), current_position + amount);
                amount // Return receipt token amount (1:1 for mock)
            }

            fn withdraw_with_yield(
                ref self: ContractState,
                receipt_token: ContractAddress,
                amount: u256,
            ) -> u256 {
                let user = starknet::get_caller_address();
                let current_position = self.user_positions.read((user, receipt_token));
                assert(current_position >= amount, 'Insufficient position');
                
                self.user_positions.write((user, receipt_token), current_position - amount);
                amount + (amount / 20) // Mock 5% yield on withdrawal
            }

            fn get_optimal_strategy(self: @ContractState, token: ContractAddress) -> u8 {
                1 // Always return strategy 1 for testing
            }

            fn get_strategy_apy(
                self: @ContractState,
                token: ContractAddress,
                strategy_type: u8
            ) -> u256 {
                self.strategy_apys.read((token, strategy_type))
            }
        }
    }

    /// Mock Atomiq Bridge for Testing
    #[starknet::contract]
    mod MockAtomiqBridge {
        use starknet::ContractAddress;

        #[storage]
        struct Storage {
            swap_counter: u256,
            swap_statuses: LegacyMap<felt252, u8>,
            exchange_rates: LegacyMap<(felt252, ContractAddress), u256>,
        }

        #[constructor]
        fn constructor(ref self: ContractState) {
            self.swap_counter.write(0);
            
            // Set mock exchange rates
            let btc_to_usdc_rate = 60000000000; // 60k USDC per BTC (6 decimals)
            let usdc_token = starknet::contract_address_const::<'USDC'>();
            self.exchange_rates.write(('BTC', usdc_token), btc_to_usdc_rate);
        }

        #[abi(embed_v0)]
        impl MockAtomiqBridgeImpl of super::super::super::interfaces::iatomiq_bridge::IAtomiqBridge<ContractState> {
            fn initiate_bitcoin_to_starknet_swap(
                ref self: ContractState,
                bitcoin_address: felt252,
                starknet_recipient: ContractAddress,
                amount_satoshi: u256,
                target_token: ContractAddress,
            ) -> felt252 {
                let swap_id = self.swap_counter.read() + 1;
                self.swap_counter.write(swap_id);
                
                let swap_id_felt: felt252 = swap_id.try_into().unwrap();
                self.swap_statuses.write(swap_id_felt, 1); // Processing status
                
                swap_id_felt
            }

            fn get_swap_status(self: @ContractState, swap_id: felt252) -> u8 {
                self.swap_statuses.read(swap_id)
            }

            fn get_exchange_rate(
                self: @ContractState,
                from_token: felt252,
                to_token: ContractAddress
            ) -> u256 {
                self.exchange_rates.read((from_token, to_token))
            }
        }
    }

    /// Mock ERC20 Token for Testing
    #[starknet::contract]
    mod MockERC20 {
        use starknet::ContractAddress;
        use openzeppelin::token::erc20::ERC20Component;

        component!(path: ERC20Component, storage: erc20, event: ERC20Event);

        #[abi(embed_v0)]
        impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;
        #[abi(embed_v0)]
        impl ERC20MetadataImpl = ERC20Component::ERC20MetadataImpl<ContractState>;
        impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

        #[storage]
        struct Storage {
            #[substorage(v0)]
            erc20: ERC20Component::Storage,
        }

        #[event]
        #[derive(Drop, starknet::Event)]
        enum Event {
            #[flat]
            ERC20Event: ERC20Component::Event,
        }

        #[constructor]
        fn constructor(
            ref self: ContractState,
            name: ByteArray,
            symbol: ByteArray,
            initial_supply: u256,
            recipient: ContractAddress
        ) {
            self.erc20.initializer(name, symbol);
            self.erc20._mint(recipient, initial_supply);
        }

        #[abi(embed_v0)]
        impl MockERC20Impl of super::super::super::interfaces::imock_erc20::IMockERC20<ContractState> {
            fn mint(ref self: ContractState, to: ContractAddress, amount: u256) {
                self.erc20._mint(to, amount);
            }

            fn burn(ref self: ContractState, from: ContractAddress, amount: u256) {
                self.erc20._burn(from, amount);
            }
        }
    }
}