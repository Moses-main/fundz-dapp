use starknet::ContractAddress;

// Define the contract interface
#[starknet::interface]
pub trait IFundLoom<TContractState> {
    // Admin functions
    fn set_allowed_token(ref self: TContractState, token: ContractAddress, allowed: bool);

    // Campaigns
    fn create_campaign(
        ref self: TContractState,
        name: ByteArray,
        charity: ContractAddress,
        target_amount: u256,
        duration_in_seconds: u64
    ) -> u256;
    fn deactivate_campaign(ref self: TContractState, id: u256);
    fn activate_campaign(ref self: TContractState, id: u256);

    // Donations
    fn donate_native_token(ref self: TContractState, campaign_id: u256, amount: u256);
    fn donate_erc20(ref self: TContractState, campaign_id: u256, token: ContractAddress, amount: u256);

    // Withdrawals
    fn withdraw_native_token(ref self: TContractState, campaign_id: u256);
    fn withdraw_erc20(ref self: TContractState, campaign_id: u256, token: ContractAddress);
    fn transfer_native_funds(ref self: TContractState, campaign_id: u256, to: ContractAddress);
    fn transfer_erc20_funds(
        ref self: TContractState,
        campaign_id: u256,
        token: ContractAddress,
        to: ContractAddress
    );

    // Views
    fn get_campaign(self: @TContractState, id: u256) -> FundLoom::Campaign;
    fn get_campaign_balance(self: @TContractState, id: u256, token: ContractAddress) -> u256;
    fn get_all_campaign_ids(self: @TContractState) -> Array<u256>;
    fn get_campaign_id_counter(self: @TContractState) -> u256;
    fn get_is_allowed_token(self: @TContractState, token: ContractAddress) -> bool;
    fn get_token_raised(self: @TContractState, campaign_id: u256, token: ContractAddress) -> u256;
    fn get_donor_total_native_token(self: @TContractState, donor: ContractAddress) -> u256;
}

/// @title FundLoom (Starknet-ready, Extended)
/// @notice Campaigns with Native-ERC20 & ERC20 (USDC/USDT) donations, balances,
///         campaign names, admin activation toggles, safe withdrawals,
///         token whitelist.
#[starknet::contract]
pub mod FundLoom {
    // --- Standard library imports ---
    // use super::IRegistry; // Import the interface
    use starknet::{
        ContractAddress, get_caller_address, get_contract_address, get_block_timestamp,
    };
    use starknet::storage::{ // For persistent storage.
        Map, MutableVecTrait, StoragePathEntry, StoragePointerReadAccess, StoragePointerWriteAccess,
        VecTrait, Vec,
    };
    use core::num::traits::Zero; // For zero checks on u256

    // --- OpenZeppelin component imports ---
    use openzeppelin::access::ownable::OwnableComponent;
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    // --- Component declarations ---
    // Ownable component for access control (only owner can perform certain actions)
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // --- Data structures ---

    /// @dev Represents a crowdfunding campaign.
    #[derive(Drop, Clone, Serde, starknet::Store)]
    pub struct Campaign {
        pub id: u256, // incremental id
        pub name: ByteArray, // campaign name/title
        pub creator: ContractAddress, // campaign creator (has withdraw rights)
        pub charity: ContractAddress, // withdrawal destination
        pub target_amount: u256, // goal in native token (informational)
        pub raised_amount: u256, // Native token raised (net of withdrawals)
        pub deadline: u64, // unix seconds
        pub is_active: bool, // donations allowed only when true
        pub created_at: u64, // unix seconds
        pub total_donors: u256, // unique donors count
        pub is_funds_transferred: bool, // flag to track if funds were transferred (for native token)
    }

    // --- Storage ---
    #[storage]
    pub struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage, // Storage for the Ownable component

        pub campaign_id_counter: u256, // Incremental counter for campaign IDs
        pub campaigns: Map<u256, Campaign>, // Mapping from campaign ID to Campaign struct
        pub campaign_ids: Vec<u256>, // Vector to store all active campaign IDs

        // Unique donors per campaign
        pub has_donated: Map<(u256, ContractAddress), bool>,

        // Per-token totals raised (raw token units; depends on token decimals)
        pub token_raised: Map<(u256, ContractAddress), u256>,

        // Optional global donor leaderboard (Native-ERC20 aggregate)
        pub donor_total_native_token: Map<ContractAddress, u256>,

        // Token whitelist: maps token address to a boolean indicating if it's allowed
        pub is_allowed_token: Map<ContractAddress, bool>,

        // Address of the ERC20 token used as 'native' currency (e.g., WETH, USDC)
        pub native_token_address: ContractAddress,
    }

    // --- Events ---
    // Events must derive 'Drop, starknet::Event' and have the '#[event]' attribute
    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        // Events from the Ownable component
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        // Custom events for FundLoom contract
        CampaignCreated: CampaignCreated,
        CampaignActivated: CampaignActivated,
        CampaignDeactivated: CampaignDeactivated,
        TokenWhitelistUpdated: TokenWhitelistUpdated,
        DonatedNativeToken: DonatedNativeToken,
        WithdrawnNativeToken: WithdrawnNativeToken,
        DonatedERC20: DonatedERC20,
        WithdrawnERC20: WithdrawnERC20,
        NativeFundsTransferred: NativeFundsTransferred,
        ERC20FundsTransferred: ERC20FundsTransferred,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CampaignCreated {
        #[key]
        pub id: u256,
        pub name: ByteArray,
        #[key]
        pub creator: ContractAddress,
        #[key]
        pub charity: ContractAddress,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CampaignActivated {
        #[key]
        pub id: u256,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CampaignDeactivated {
        #[key]
        pub id: u256,
        pub timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    pub struct TokenWhitelistUpdated {
        #[key]
        pub token: ContractAddress,
        pub allowed: bool,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DonatedNativeToken {
        #[key]
        pub campaign_id: u256,
        #[key]
        pub donor: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct WithdrawnNativeToken {
        #[key]
        pub campaign_id: u256,
        #[key]
        pub to: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct DonatedERC20 {
        #[key]
        pub campaign_id: u256,
        #[key]
        pub donor: ContractAddress,
        #[key]
        pub token: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct WithdrawnERC20 {
        #[key]
        pub campaign_id: u256,
        #[key]
        pub token: ContractAddress,
        #[key]
        pub to: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct NativeFundsTransferred {
        #[key]
        pub campaign_id: u256,
        #[key]
        pub to: ContractAddress,
        pub amount: u256,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ERC20FundsTransferred {
        #[key]
        pub campaign_id: u256,
        #[key]
        pub token: ContractAddress,
        #[key]
        pub to: ContractAddress,
        pub amount: u256,
    }

    // --- Mixin implementations for OpenZeppelin components ---
    // Ownable Mixin: Exposes external functions for ownership management
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    // Internal implementation for Ownable component
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    // --- Contract Implementation ---
    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress, native_token_addr: ContractAddress) {
        // Initialize the Ownable component with the deployer as owner
        self.ownable.initializer(owner);
        // Store the address of the ERC20 token designated as the native currency
        self.native_token_address.write(native_token_addr);
        // Campaign ID counter starts at 0
        self.campaign_id_counter.write(0);
    }

    // Implement the contract interface
    #[abi(embed_v0)]
    impl FundLoomImpl of super::IFundLoom<ContractState> {
        // --- Admin functions ---

        /// @notice Sets whether an ERC20 token is allowed for donations. Only the contract owner can call this.
        /// @param token The address of the ERC20 token.
        /// @param allowed True to allow, false to disallow.
        fn set_allowed_token(ref self: ContractState, token: ContractAddress, allowed: bool) {
            // Assert that only the contract owner can call this function
            self.ownable.assert_only_owner();
            // Require token address is not zero
            assert(token != Zero::zero(), 'BAD_TOKEN');
            // Update the whitelist status for the token
            self.is_allowed_token.write(token, allowed);
            // Emit an event indicating the whitelist update
            self.emit(Event::TokenWhitelistUpdated(TokenWhitelistUpdated { token, allowed }));
        }

        // --- Campaigns ---

        /// @notice Creates a new crowdfunding campaign.
        /// @param name The name/title of the campaign.
        /// @param charity The address where funds are eventually withdrawn to.
        /// @param target_amount The informational target amount in native token.
        /// @param duration_in_seconds The duration of the campaign in seconds.
        /// @return The ID of the newly created campaign.
        fn create_campaign(
            ref self: ContractState,
            name: ByteArray,
            charity: ContractAddress,
            target_amount: u256,
            duration_in_seconds: u64
        ) -> u256 {
            let caller = get_caller_address();
            let current_timestamp = get_block_timestamp();

            // Input validation
            assert(name.len() > 0, 'NO_NAME');
            assert(charity != Zero::zero(), 'BAD_CHARITY');
            assert(duration_in_seconds > 0, 'BAD_DURATION');

            // Increment campaign ID counter
            let mut current_id = self.campaign_id_counter.read();
            current_id += 1;
            self.campaign_id_counter.write(current_id);

            // Create new campaign struct
            let new_campaign = Campaign {
                id: current_id,
                name: name.clone(),
                creator: caller,
                charity,
                target_amount,
                raised_amount: 0,
                deadline: current_timestamp + duration_in_seconds,
                is_active: true,
                created_at: current_timestamp,
                total_donors: 0,
                is_funds_transferred: false,
            };

            // Store the new campaign
            self.campaigns.write(current_id, new_campaign);
            self.campaign_ids.push(current_id); // Add ID to the list of all campaign IDs

            // Emit CampaignCreated event
            self.emit(
                Event::CampaignCreated(
                    CampaignCreated { id: current_id, name, creator: caller, charity }
                )
            );

            current_id
        }

        /// @notice Deactivates a campaign, preventing further donations. Only the contract owner can call this.
        /// @param id The ID of the campaign to deactivate.
        fn deactivate_campaign(ref self: ContractState, id: u256) {
            self.ownable.assert_only_owner(); // Only owner can deactivate
            let mut campaign = self.campaigns.read(id);
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            assert(campaign.is_active, 'ALREADY_OFF');

            campaign.is_active = false;
            self.campaigns.write(id, campaign);
            let timestamp = get_block_timestamp();
            self.emit(Event::CampaignDeactivated(CampaignDeactivated { id, timestamp }));
        }

        /// @notice Activates a campaign, allowing donations again. Only the contract owner can call this.
        /// @param id The ID of the campaign to activate.
        fn activate_campaign(ref self: ContractState, id: u256) {
            self.ownable.assert_only_owner(); // Only owner can activate
            let mut campaign = self.campaigns.read(id);
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            assert(!campaign.is_active, 'ALREADY_ON');

            campaign.is_active = true;
            self.campaigns.write(id, campaign);
            let timestamp = get_block_timestamp();
            self.emit(Event::CampaignActivated(CampaignActivated { id, timestamp }));
        }

        // --- Donations (Native Token) ---

        /// @notice Donates native ERC20 tokens to a campaign.
        /// @dev This assumes the caller has already approved this contract to spend `amount` of native tokens.
        /// @param campaign_id The ID of the campaign to donate to.
        /// @param amount The amount of native tokens to donate.
        fn donate_native_token(ref self: ContractState, campaign_id: u256, amount: u256) {
            let caller = get_caller_address();
            let current_timestamp = get_block_timestamp();
            let mut campaign = self.campaigns.read(campaign_id);

            // Validation checks
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            assert(campaign.is_active, 'NOT_ACTIVE');
            assert(current_timestamp <= campaign.deadline, 'ENDED');
            assert(amount > 0, 'NO_VALUE');

            // Transfer native tokens from donor to this contract
            let native_token_dispatcher = IERC20Dispatcher {
                contract_address: self.native_token_address.read()
            };
            // Note: In Cairo, 'safeTransferFrom' behavior is typically handled by the dispatcher
            // reverting on failure, so no explicit boolean check is needed here.
            native_token_dispatcher.transfer_from(caller, get_contract_address(), amount);

            // Update campaign and donor statistics
            campaign.raised_amount += amount;
            if !self.has_donated.read((campaign_id, caller)) {
                self.has_donated.write((campaign_id, caller), true);
                campaign.total_donors += 1;
            }
            self.donor_total_native_token.write(caller, self.donor_total_native_token.read(caller) + amount);
            self.campaigns.write(campaign_id, campaign); // Update campaign storage

            // Emit DonatedNativeToken event
            self.emit(Event::DonatedNativeToken(DonatedNativeToken { campaign_id, donor: caller, amount }));
        }

        // --- Donations (ERC20) ---

        /// @notice Donates specified ERC20 tokens to a campaign.
        /// @dev This assumes the caller has already approved this contract to spend `amount` of the specified ERC20 token.
        /// @param campaign_id The ID of the campaign to donate to.
        /// @param token The address of the ERC20 token.
        /// @param amount The amount of ERC20 tokens to donate.
        fn donate_erc20(ref self: ContractState, campaign_id: u256, token: ContractAddress, amount: u256) {
            let caller = get_caller_address();
            let current_timestamp = get_block_timestamp();
            let mut campaign = self.campaigns.read(campaign_id);

            // Validation checks
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            assert(campaign.is_active, 'NOT_ACTIVE');
            assert(current_timestamp <= campaign.deadline, 'ENDED');
            assert(self.is_allowed_token.read(token), 'TOKEN_NOT_ALLOWED');
            assert(amount > 0, 'NO_VALUE');

            // Transfer ERC20 tokens from donor to this contract
            let erc20_dispatcher = IERC20Dispatcher { contract_address: token };
            erc20_dispatcher.transfer_from(caller, get_contract_address(), amount);

            // Update campaign and donor statistics
            self.token_raised.write((campaign_id, token), self.token_raised.read((campaign_id, token)) + amount);
            if !self.has_donated.read((campaign_id, caller)) {
                self.has_donated.write((campaign_id, caller), true);
                campaign.total_donors += 1;
            }
            self.campaigns.write(campaign_id, campaign); // Update campaign storage

            // Emit DonatedERC20 event
            self.emit(Event::DonatedERC20(DonatedERC20 { campaign_id, donor: caller, token, amount }));
        }

        // --- Withdrawals ---

        /// @notice Allows the campaign creator to withdraw all collected native tokens after the campaign deadline.
        /// @dev Can only be called once per campaign for native tokens.
        /// @param campaign_id The ID of the campaign.
        fn withdraw_native_token(ref self: ContractState, campaign_id: u256) {
            let caller = get_caller_address();
            let current_timestamp = get_block_timestamp();
            let mut campaign = self.campaigns.read(campaign_id);
            let campaign_creator = campaign.creator;

            // Validation checks
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            assert(campaign_creator == caller, 'NOT_CREATOR');
            assert(current_timestamp > campaign.deadline, 'CAMPAIGN_NOT_ENDED');
            assert(campaign.raised_amount > 0, 'NO_FUNDS');
            assert(!campaign.is_funds_transferred, 'FUNDS_ALREADY_TRANSFERRED');

            let amount_to_withdraw = campaign.raised_amount;

            // Reset campaign's raised amount and set transfer flag
            campaign.raised_amount = 0;
            campaign.is_funds_transferred = true;
            self.campaigns.write(campaign_id, campaign);

            // Transfer native tokens to the creator
            let native_token_dispatcher = IERC20Dispatcher {
                contract_address: self.native_token_address.read()
            };
            native_token_dispatcher.transfer(campaign_creator, amount_to_withdraw);

            // Emit WithdrawnNativeToken event
            self.emit(Event::WithdrawnNativeToken(WithdrawnNativeToken { campaign_id, to: campaign_creator, amount: amount_to_withdraw }));
        }

        /// @notice Allows the campaign creator to withdraw all collected ERC20 tokens of a specific type after the campaign deadline.
        /// @dev Can only be called once per campaign for a given ERC20 token type.
        /// @param campaign_id The ID of the campaign.
        /// @param token The address of the ERC20 token to withdraw.
        fn withdraw_erc20(ref self: ContractState, campaign_id: u256, token: ContractAddress) {
            let caller = get_caller_address();
            let current_timestamp = get_block_timestamp();
            let mut campaign = self.campaigns.read(campaign_id);
            let campaign_creator = campaign.creator;

            // Validation checks
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            assert(campaign_creator == caller, 'NOT_CREATOR');
            assert(current_timestamp > campaign.deadline, 'CAMPAIGN_NOT_ENDED');
            assert(self.is_allowed_token.read(token), 'TOKEN_NOT_ALLOWED');

            let amount_to_withdraw = self.token_raised.read((campaign_id, token));
            assert(amount_to_withdraw > 0, 'NO_TOKEN_BALANCE');
            assert(!campaign.is_funds_transferred, 'FUNDS_ALREADY_TRANSFERRED'); // Assumes this flag applies to all funds for simplicity.

            // Reset campaign's raised amount for this token and set transfer flag
            self.token_raised.write((campaign_id, token), 0);
            campaign.is_funds_transferred = true; // Mark as transferred generally, as per Solidity logic
            self.campaigns.write(campaign_id, campaign);

            // Transfer ERC20 tokens to the creator
            let erc20_dispatcher = IERC20Dispatcher { contract_address: token };
            erc20_dispatcher.transfer(campaign_creator, amount_to_withdraw);

            // Emit WithdrawnERC20 event
            self.emit(Event::WithdrawnERC20(WithdrawnERC20 { campaign_id, token, to: campaign_creator, amount: amount_to_withdraw }));
        }

        /// @dev Transfers native tokens to an arbitrary address after the campaign ends.
        /// @param campaign_id ID of the campaign
        /// @param to Address to transfer the funds to
        fn transfer_native_funds(ref self: ContractState, campaign_id: u256, to: ContractAddress) {
            let caller = get_caller_address();
            let current_timestamp = get_block_timestamp();
            let mut campaign = self.campaigns.read(campaign_id);

            // Validation checks
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            assert(campaign.creator == caller, 'NOT_CREATOR');
            assert(current_timestamp > campaign.deadline, 'CAMPAIGN_NOT_ENDED');
            assert(campaign.raised_amount > 0, 'NO_FUNDS');
            assert(to != Zero::zero(), 'INVALID_RECIPIENT');
            assert(!campaign.is_funds_transferred, 'FUNDS_ALREADY_TRANSFERRED');

            let amount_to_transfer = campaign.raised_amount;

            // Reset campaign's raised amount and set transfer flag
            campaign.raised_amount = 0;
            campaign.is_funds_transferred = true;
            self.campaigns.write(campaign_id, campaign);

            // Transfer native tokens to the recipient
            let native_token_dispatcher = IERC20Dispatcher {
                contract_address: self.native_token_address.read()
            };
            native_token_dispatcher.transfer(to, amount_to_transfer);

            // Emit NativeFundsTransferred event
            self.emit(Event::NativeFundsTransferred(NativeFundsTransferred { campaign_id, to, amount: amount_to_transfer }));
        }

        /// @dev Transfers ERC20 tokens to an arbitrary address after the campaign ends.
        /// @param campaign_id ID of the campaign
        /// @param token Address of the ERC20 token
        /// @param to Address to transfer the tokens to
        fn transfer_erc20_funds(
            ref self: ContractState,
            campaign_id: u256,
            token: ContractAddress,
            to: ContractAddress
        ) {
            let caller = get_caller_address();
            let current_timestamp = get_block_timestamp();
            let mut campaign = self.campaigns.read(campaign_id);

            // Validation checks
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            assert(campaign.creator == caller, 'NOT_CREATOR');
            assert(current_timestamp > campaign.deadline, 'CAMPAIGN_NOT_ENDED');
            assert(self.is_allowed_token.read(token), 'TOKEN_NOT_ALLOWED');
            assert(to != Zero::zero(), 'INVALID_RECIPIENT');

            let amount_to_transfer = self.token_raised.read((campaign_id, token));
            assert(amount_to_transfer > 0, 'NO_TOKEN_BALANCE');
            assert(!campaign.is_funds_transferred, 'FUNDS_ALREADY_TRANSFERRED'); // As per Solidity, this flag applies to all funds

            // Reset campaign's raised amount for this token and set transfer flag
            self.token_raised.write((campaign_id, token), 0);
            campaign.is_funds_transferred = true; // Mark as transferred generally
            self.campaigns.write(campaign_id, campaign);

            // Transfer ERC20 tokens to the recipient
            let erc20_dispatcher = IERC20Dispatcher { contract_address: token };
            erc20_dispatcher.transfer(to, amount_to_transfer);

            // Emit ERC20FundsTransferred event
            self.emit(Event::ERC20FundsTransferred(ERC20FundsTransferred { campaign_id, token, to, amount: amount_to_transfer }));
        }


        // --- Views ---

        /// @notice Retrieves the details of a specific campaign.
        /// @param id The ID of the campaign.
        /// @return The Campaign struct.
        fn get_campaign(self: @ContractState, id: u256) -> Campaign {
            let campaign = self.campaigns.read(id);
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            campaign
        }

        /// @notice Get live balance for native token (token=0) or ERC20.
        /// @param id The ID of the campaign.
        /// @param token The address of the token (0x0 for native token).
        /// @return The balance of the specified token for the campaign.
        fn get_campaign_balance(self: @ContractState, id: u256, token: ContractAddress) -> u256 {
            let campaign = self.campaigns.read(id);
            assert(campaign.id != 0, 'NO_CAMPAIGN');
            if token == Zero::zero() {
                // Return native token balance
                campaign.raised_amount
            } else {
                // Return ERC20 token balance
                self.token_raised.read((id, token))
            }
        }

        /// @notice Retrieves a list of all existing campaign IDs.
        /// @return An Array containing all campaign IDs.
        fn get_all_campaign_ids(self: @ContractState) -> Array<u256> {
            let mut all_ids = array![];
            // Iterate over the Vec and append each ID to the result Array
            for i in 0..self.campaign_ids.len() {
                let val = self.campaign_ids[i].read();
                all_ids.append(val);
            }
            all_ids
        }

        /// @notice Returns the current value of the campaign ID counter.
        fn get_campaign_id_counter(self: @ContractState) -> u256 {
            self.campaign_id_counter.read()
        }

        /// @notice Checks if a given token address is whitelisted.
        /// @param token The address of the token to check.
        /// @return True if the token is allowed, false otherwise.
        fn get_is_allowed_token(self: @ContractState, token: ContractAddress) -> bool {
            self.is_allowed_token.read(token)
        }

        /// @notice Returns the total amount of a specific ERC20 token raised for a campaign.
        /// @param campaign_id The ID of the campaign.
        /// @param token The address of the ERC20 token.
        /// @return The total amount of the specified ERC20 token raised.
        fn get_token_raised(self: @ContractState, campaign_id: u256, token: ContractAddress) -> u256 {
            self.token_raised.read((campaign_id, token))
        }

        /// @notice Returns the total amount of native tokens donated by a specific donor.
        /// @param donor The address of the donor.
        /// @return The total amount of native tokens donated by the donor.
        fn get_donor_total_native_token(self: @ContractState, donor: ContractAddress) -> u256 {
            self.donor_total_native_token.read(donor)
        }
    }
}