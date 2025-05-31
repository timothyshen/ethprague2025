# LayerZero Composed OApp Pattern for Cross-Chain Staking

This repository demonstrates the **Composed** message pattern in LayerZero, which enables a message to transfer from a source chain to a destination chain and then call an external contract (A → B1 → B2).

## Architecture Overview

The composed pattern involves three components:

- **Chain A (Source)**: MyOApp contract that initiates cross-chain messages
- **Chain B1 (Destination OApp)**: MyOApp contract that receives and processes messages
- **Chain B2 (Composed Contract)**: StakingAggregator contract that handles the final staking logic

```
┌─────────────┐    LayerZero     ┌─────────────┐    sendCompose    ┌──────────────────┐
│   Chain A   │   ──────────>    │   Chain B1  │   ──────────>     │     Chain B2     │
│   MyOApp    │                  │   MyOApp    │                   │ StakingAggregator│
│  (Source)   │                  │(Destination)│                   │   (Composed)     │
└─────────────┘                  └─────────────┘                   └──────────────────┘
```

## Contract Overview

### 1. MyOApp.sol

The main OApp contract that handles cross-chain messaging and implements the composed pattern.

**Key Functions:**

- `stakeOnDestination()`: Stakes tokens by locking them on source chain and triggering cross-chain staking
- `_lzReceive()`: Receives cross-chain messages and calls `endpoint.sendCompose()` to trigger composed contracts

**Composed Pattern Implementation:**

```solidity
function _lzReceive(
    Origin calldata _origin,
    bytes32 _guid,
    bytes calldata payload,
    address _executor,
    bytes calldata _extraData
) internal override {
    (uint256 _amount, address _user, address _composedAddress) = abi.decode(payload, (uint256, address, address));

    // Create payload for the composed message
    bytes memory composedPayload = abi.encode(_amount, _user);

    // Send composed message to StakingAggregator (A -> B1 -> B2)
    endpoint.sendCompose(_composedAddress, _guid, 0, composedPayload);
}
```

### 2. StakingAggregator.sol (StakeLock.sol)

Implements `ILayerZeroComposer` to receive composed messages from LayerZero.

**Key Functions:**

- `lzCompose()`: The required function from ILayerZeroComposer that processes composed messages
- `unstake()`: Allows users to unstake their tokens locally

**Composed Message Handler:**

```solidity
function lzCompose(
    address _from,
    bytes32 _guid,
    bytes calldata _message,
    address _executor,
    bytes calldata _extraData
) external payable override {
    require(_from == oApp, "!oApp");
    require(msg.sender == endpoint, "!endpoint");

    (uint256 _amount, address _user) = abi.decode(_message, (uint256, address));

    // Perform staking logic
    stakedAmount[_user] += _amount;
    totalStaked += _amount;

    emit Staked(_user, _amount);
}
```

### 3. StakeAggregator.sol

A standalone staking contract for local operations without LayerZero integration.

## How the Composed Pattern Works

### Step 1: User initiates cross-chain staking

```solidity
// User calls stakeOnDestination on Chain A
myOApp.stakeOnDestination{value: 1 ether}(
    destinationEid,      // Chain B endpoint ID
    stakingAggregatorAddr, // Composed contract address on Chain B
    options              // LayerZero execution options
);
```

### Step 2: Source chain processes the request

1. MyOApp locks the tokens on the source chain
2. Creates a payload with `(amount, user, composedAddress)`
3. Sends cross-chain message via LayerZero

### Step 3: Destination chain receives the message

1. MyOApp on Chain B receives the message in `_lzReceive()`
2. Decodes the payload to extract amount, user, and composed address
3. Creates a new payload for the composed message: `(amount, user)`
4. Calls `endpoint.sendCompose()` to trigger the composed contract

### Step 4: Composed contract executes

1. StakingAggregator's `lzCompose()` function is called
2. Validates the message came from the correct OApp and endpoint
3. Performs the staking logic (updates balances, emits events)

## Benefits of the Composed Pattern

1. **Modularity**: Separates cross-chain messaging logic from business logic
2. **Flexibility**: Composed contracts can be updated independently
3. **Extensibility**: Multiple composed contracts can be called from one message
4. **Gas Efficiency**: Composed execution happens in the same transaction as message receipt

## Usage Example

```solidity
// Deploy contracts
MyOApp sourceOApp = new MyOApp(sourceEndpoint, owner);
MyOApp destOApp = new MyOApp(destEndpoint, owner);
StakingAggregator stakingContract = new StakingAggregator(destEndpoint, address(destOApp));

// Configure LayerZero paths between chains (omitted for brevity)

// User stakes 1 ETH cross-chain
sourceOApp.stakeOnDestination{value: 1 ether}(
    destChainEid,
    address(stakingContract),
    options
);

// After LayerZero processes the message:
// - 1 ETH is locked on source chain
// - User's stake is recorded on destination chain's StakingAggregator
```

## Key Considerations

1. **Message Payload Structure**: Ensure consistent encoding/decoding between OApp and composed contracts
2. **Access Control**: Composed contracts must validate messages come from authorized OApps
3. **Gas Limits**: Set appropriate gas limits for composed execution
4. **Error Handling**: Implement proper error handling for failed composed calls

## Related Documentation

- [LayerZero Composed Pattern Documentation](https://docs.layerzero.network/v2/developers/evm/oapp/message-design-patterns#composed)
- [LayerZero OApp Standards](https://docs.layerzero.network/v2/developers/evm/oapp/overview)
- [ILayerZeroComposer Interface](https://docs.layerzero.network/v2/developers/evm/technical-reference/interfaces)

This implementation demonstrates a practical use case of LayerZero's composed messaging pattern for cross-chain staking, showcasing how to build modular and extensible omnichain applications.
