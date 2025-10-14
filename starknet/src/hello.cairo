#[starknet::interface]
trait IHelloStarknet<TContractState> {
    fn increase_balance(ref self: TContractState, amount: u8);
    fn get_balance(self: @TContractState) -> u8;
}

#[starknet::contract]
mod HelloStarknet {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[storage]
    struct Storage {
        balance: u8,
    }

    #[external(v0)]
    impl HelloStarknetImpl of super::IHelloStarknet<ContractState> {
        fn increase_balance(ref self: ContractState, amount: u8) {
            self.balance.write(self.balance.read() + amount);
        }

        fn get_balance(self: @ContractState) -> u8 {
            self.balance.read()
        }
    }
}
