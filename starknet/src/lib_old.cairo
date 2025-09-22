// #![allow(unused)]

// #[starknet::contract]
// mod FundloomCampaign {
//     use starknet::ContractAddress;
//     use starknet::get_caller_address;

//     #[storage]
//     struct Storage {
//         // Campaign details
//         owner: ContractAddress,
//         target_amount: u128,
//         raised_amount: u128,
//         // Track contributors and their contributions
//         contributions: LegacyMap<ContractAddress, u128>,
//         // Campaign status
//         is_active: bool,
//     }

//     #[event]
//     #[derive(Drop, starknet::Event)]
//     enum Event {
//         ContributionReceived: ContributionReceived,
//         FundsWithdrawn: FundsWithdrawn,
//     }

//     #[derive(Drop, starknet::Event)]
//     struct ContributionReceived {
//         contributor: ContractAddress,
//         amount: u128,
//         timestamp: u64,
//     }

//     #[derive(Drop, starknet::Event)]
//     struct FundsWithdrawn {
//         amount: u128,
//         timestamp: u64,
//     }

//     #[constructor]
//     fn constructor(
//         ref self: ContractState,
//         target_amount: u128,
//     ) {
//         self.owner.write(get_caller_address());
//         self.target_amount.write(target_amount);
//         self.raised_amount.write(0);
//         self.is_active.write(true);
//     }

//     // Contribute to the campaign
//     #[external(v0)]
//     fn contribute(ref self: ContractState, amount: u128) {
//         let caller = get_caller_address();
//         assert(self.is_active.read(), 'Campaign is not active');
//         assert(amount > 0, 'Contribution must be greater than 0');

//         // Update contribution amount
//         let current_contribution = self.contributions.read(caller);
//         self.contributions.write(caller, current_contribution + amount);
        
//         // Update total raised amount
//         self.raised_amount.write(self.raised_amount.read() + amount);

//         // Emit event
//         self.emit(Event::ContributionReceived(ContributionReceived {
//             contributor: caller,
//             amount,
//             timestamp: get_block_timestamp(),
//         }));
//     }

//     // Withdraw funds (only owner)
//     #[external(v0)]
//     fn withdraw(ref self: ContractState) {
//         let caller = get_caller_address();
//         assert(caller == self.owner.read(), 'Only owner can withdraw');
//         assert(self.raised_amount.read() > 0, 'No funds to withdraw');

//         let amount = self.raised_amount.read();
//         self.raised_amount.write(0);
        
//         // In a real contract, you would transfer the funds here
//         // This is a simplified example
        
//         // Emit event
//         self.emit(Event::FundsWithdrawn(FundsWithdrawn {
//             amount,
//             timestamp: get_block_timestamp(),
//         }));
//     }

//     // View functions
//     #[view]
//     fn get_raised_amount(self: @ContractState) -> u128 {
//         self.raised_amount.read()
//     }

//     #[view]
//     fn get_target_amount(self: @ContractState) -> u128 {
//         self.target_amount.read()
//     }

//     #[view]
//     fn get_contribution(self: @ContractState, address: ContractAddress) -> u128 {
//         self.contributions.read(address)
//     }

//     // Helper function to get current block timestamp
//     fn get_block_timestamp() -> u64 {
//         starknet::get_block_timestamp().try_into().unwrap()
//     }
// }
