#[starknet::interface]
trait ISimpleCampaign<T> {
    fn get_count(self: @T) -> u64;
    fn increment(ref self: T);
}

#[starknet::contract]
mod SimpleCounter {
    #[storage]
    struct Storage {
        count: u64,
    }
    
    #[constructor]
    fn constructor(ref self: ContractState) {
        self.count.write(0);
    }
    
    #[external(v0)]
    impl ICounterImpl of super::ISimpleCampaign<ContractState> {
        fn get_count(self: @ContractState) -> u64 {
            self.count.read()
        }
        
        fn increment(ref self: ContractState) {
            self.count.write(self.count.read() + 1);
        }
    }
}
