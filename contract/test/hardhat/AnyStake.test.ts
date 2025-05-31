import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract, ContractFactory } from 'ethers'
import { deployments, ethers } from 'hardhat'
import { Options } from '@layerzerolabs/lz-v2-utilities'

describe('AnyStake Test', function () {
    // Test constants
    const eidA = 1
    const eidB = 2
    const TEST_AMOUNT = ethers.utils.parseEther('1.0')
    const TEST_MESSAGE = "Test message"
    const INITIAL_BALANCE = ethers.utils.parseEther('100.0') // Increased initial balance

    // Contract factories and instances
    let AnyStake: ContractFactory
    let EndpointV2Mock: ContractFactory
    let ownerA: SignerWithAddress
    let ownerB: SignerWithAddress
    let endpointOwner: SignerWithAddress
    let userA: SignerWithAddress
    let userB: SignerWithAddress
    let anyStakeA: Contract
    let anyStakeB: Contract
    let mockEndpointV2A: Contract
    let mockEndpointV2B: Contract

    // Setup before all tests
    before(async function () {
        // Get signers
        const signers = await ethers.getSigners()
        ;[ownerA, ownerB, endpointOwner, userA, userB] = signers

        // Get contract factories
        AnyStake = await ethers.getContractFactory('AnyStake')
        const EndpointV2MockArtifact = await deployments.getArtifact('EndpointV2Mock')
        EndpointV2Mock = new ContractFactory(
            EndpointV2MockArtifact.abi,
            EndpointV2MockArtifact.bytecode,
            endpointOwner
        )
    })

    // Setup before each test
    beforeEach(async function () {
        console.log('\n=== Setup Debug Information ===')
        
        // Deploy mock endpoints
        mockEndpointV2A = await EndpointV2Mock.deploy(eidA)
        await mockEndpointV2A.deployed()
        console.log('MockEndpointV2A deployed at:', mockEndpointV2A.address)
        
        mockEndpointV2B = await EndpointV2Mock.deploy(eidB)
        await mockEndpointV2B.deployed()
        console.log('MockEndpointV2B deployed at:', mockEndpointV2B.address)

        // Deploy AnyStake instances
        anyStakeA = await AnyStake.deploy(mockEndpointV2A.address, ownerA.address)
        await anyStakeA.deployed()
        console.log('AnyStakeA deployed at:', anyStakeA.address)
        
        anyStakeB = await AnyStake.deploy(mockEndpointV2B.address, ownerB.address)
        await anyStakeB.deployed()
        console.log('AnyStakeB deployed at:', anyStakeB.address)

        // Setup cross-chain communication
        await mockEndpointV2A.setDestLzEndpoint(anyStakeB.address, mockEndpointV2B.address)
        await mockEndpointV2B.setDestLzEndpoint(anyStakeA.address, mockEndpointV2A.address)
        console.log('Cross-chain communication setup completed')

        // Set peers
        await anyStakeA.connect(ownerA).setPeer(eidB, ethers.utils.zeroPad(anyStakeB.address, 32))
        await anyStakeB.connect(ownerB).setPeer(eidA, ethers.utils.zeroPad(anyStakeA.address, 32))
        console.log('Peers set successfully')

        // Fund test accounts
        const funder = (await ethers.getSigners())[0]
        console.log('Funder address:', funder.address)
        console.log('Funder balance:', ethers.utils.formatEther(await funder.getBalance()))
        
        // Fund accounts and log balances
        for (const account of [userA, userB, ownerA, ownerB, endpointOwner]) {
            await funder.sendTransaction({
                to: account.address,
                value: INITIAL_BALANCE
            })
            console.log(`${account.address} balance after funding:`, 
                ethers.utils.formatEther(await account.getBalance()))
        }
        
        console.log('=== Setup Completed ===\n')
    })

    describe('Initialization', function () {
        it('should deploy with correct initial state', async function () {
            expect(await anyStakeA.data()).to.equal('Nothing received yet.')
            expect(await anyStakeA.lockedBalances(userA.address)).to.equal(0)
        })
    })

    describe('Deposit Functionality', function () {
        it('should successfully deposit ETH', async function () {
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            // Get the operation value first
            const operation = await anyStakeA.OPERATION_DEPOSIT()
            
            console.log('\n=== LayerZero Fee Debug ===')
            console.log('Options:', options)
            console.log('Source EID:', eidA)
            console.log('Destination EID:', eidB)
            console.log('Operation:', operation)
            console.log('Amount:', ethers.utils.formatEther(TEST_AMOUNT))
            console.log('User:', userA.address)
            console.log('Composed Address:', anyStakeB.address)

            // Get quote for deposit with proper parameters
            const [nativeFee] = await anyStakeA.quote(
                eidB,
                operation,
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )

            // Calculate the protocol fee based on the error pattern
            const baseFee = nativeFee
            const protocolFee = ethers.utils.parseEther('1.0') // Protocol fee
            const totalFee = baseFee.add(protocolFee)
            const totalValue = totalFee.add(TEST_AMOUNT)

            console.log('\n=== Fee Calculation Debug ===')
            console.log('Base fee (from quote):', ethers.utils.formatEther(baseFee))
            console.log('Protocol fee:', ethers.utils.formatEther(protocolFee))
            console.log('Total fee:', ethers.utils.formatEther(totalFee))
            console.log('Total value to send:', ethers.utils.formatEther(totalValue))

            // Log balances before transaction
            console.log('\n=== Balance Debug ===')
            console.log('UserA balance before:', ethers.utils.formatEther(await userA.getBalance()))
            console.log('UserB balance before:', ethers.utils.formatEther(await userB.getBalance()))
            console.log('AnyStakeA contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(anyStakeA.address)))
            console.log('AnyStakeB contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(anyStakeB.address)))
            console.log('MockEndpointV2A balance:', ethers.utils.formatEther(await ethers.provider.getBalance(mockEndpointV2A.address)))
            console.log('MockEndpointV2B balance:', ethers.utils.formatEther(await ethers.provider.getBalance(mockEndpointV2B.address)))

            try {
                // Log transaction details before sending
                console.log('\n=== Transaction Details ===')
                const depositTx = await anyStakeA.connect(userA).populateTransaction.deposit(
                    eidB,
                    TEST_AMOUNT,
                    anyStakeB.address,
                    options,
                    { value: totalValue }
                )
                
                console.log('Transaction details:')
                console.log('From:', depositTx.from)
                console.log('To:', depositTx.to)
                console.log('Value:', ethers.utils.formatEther(depositTx.value))
                console.log('Data:', depositTx.data)

                // Execute deposit with the total fee
                const tx = await anyStakeA.connect(userA).deposit(
                    eidB,
                    TEST_AMOUNT,
                    anyStakeB.address,
                    options,
                    { value: totalValue }
                )

                // Log transaction receipt
                const receipt = await tx.wait()
                console.log('\n=== Transaction Receipt ===')
                console.log('Transaction hash:', receipt.transactionHash)
                console.log('Block number:', receipt.blockNumber)
                console.log('Gas used:', receipt.gasUsed.toString())
                console.log('Events:', receipt.events.map(e => e.event))

                // Log balances after transaction
                console.log('\n=== Balance After Transaction ===')
                console.log('UserA balance after:', ethers.utils.formatEther(await userA.getBalance()))
                console.log('UserB balance after:', ethers.utils.formatEther(await userB.getBalance()))
                console.log('AnyStakeA contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(anyStakeA.address)))
                console.log('AnyStakeB contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(anyStakeB.address)))
                console.log('MockEndpointV2A balance:', ethers.utils.formatEther(await ethers.provider.getBalance(mockEndpointV2A.address)))
                console.log('MockEndpointV2B balance:', ethers.utils.formatEther(await ethers.provider.getBalance(mockEndpointV2B.address)))

                // Verify deposit
                expect(await anyStakeA.lockedBalances(userA.address)).to.equal(TEST_AMOUNT)
                
                // Verify events
                await expect(tx)
                    .to.emit(anyStakeA, 'Deposited')
                    .withArgs(userA.address, TEST_AMOUNT)
            } catch (error) {
                console.log('\n=== Transaction Error Details ===')
                console.log('Error message:', error.message)
                if (error.data) {
                    console.log('Raw error data:', error.data)
                    const requiredAmount = ethers.BigNumber.from('0x' + error.data.slice(10))
                    console.log('Required amount in error:', ethers.utils.formatEther(requiredAmount))
                }

                // Log balances after failed transaction
                console.log('\n=== Balance After Failed Transaction ===')
                console.log('UserA balance after:', ethers.utils.formatEther(await userA.getBalance()))
                console.log('UserB balance after:', ethers.utils.formatEther(await userB.getBalance()))
                console.log('AnyStakeA contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(anyStakeA.address)))
                console.log('AnyStakeB contract balance:', ethers.utils.formatEther(await ethers.provider.getBalance(anyStakeB.address)))
                console.log('MockEndpointV2A balance:', ethers.utils.formatEther(await ethers.provider.getBalance(mockEndpointV2A.address)))
                console.log('MockEndpointV2B balance:', ethers.utils.formatEther(await ethers.provider.getBalance(mockEndpointV2B.address)))

                throw error
            }
        })

        it('should fail deposit with insufficient ETH', async function () {
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            // Get quote for deposit
            const [nativeFee] = await anyStakeA.quote(
                eidB,
                anyStakeA.OPERATION_DEPOSIT(),
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )
            console.log('Native fee:', ethers.utils.formatEther(nativeFee))
            // Try to deposit with insufficient value (less than required fee)
            await expect(
                anyStakeA.connect(userA).deposit(
                    eidB,
                    TEST_AMOUNT,
                    anyStakeB.address,
                    options,
                    { value: nativeFee.div(2) } // Send only half the required fee
                )
            ).to.be.revertedWith('NotEnoughNative')
        })
    })

    describe('Withdrawal Functionality', function () {
        beforeEach(async function () {
            // Setup initial deposit
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            const [nativeFee] = await anyStakeA.quote(
                eidB,
                anyStakeA.OPERATION_DEPOSIT(),
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )

            await anyStakeA.connect(userA).deposit(
                eidB,
                TEST_AMOUNT,
                anyStakeB.address,
                options,
                { value: nativeFee.add(TEST_AMOUNT) }
            )
        })

        it('should initiate withdrawal successfully', async function () {
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            const [nativeFee] = await anyStakeA.quote(
                eidB,
                anyStakeA.OPERATION_WITHDRAW(),
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )

            const tx = await anyStakeA.connect(userA).withdraw(
                eidB,
                TEST_AMOUNT,
                anyStakeB.address,
                options,
                { value: nativeFee }
            )

            // Verify withdrawal initiation
            const receipt = await tx.wait()
            const event = receipt.events.find(e => e.event === 'WithdrawalInitiated')
            expect(event.args.user).to.equal(userA.address)
            expect(event.args.amount).to.equal(TEST_AMOUNT)
        })

        it('should handle withdrawal confirmation', async function () {
            // First initiate withdrawal
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            const [nativeFee] = await anyStakeA.quote(
                eidB,
                anyStakeA.OPERATION_WITHDRAW(),
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )

            const tx = await anyStakeA.connect(userA).withdraw(
                eidB,
                TEST_AMOUNT,
                anyStakeB.address,
                options,
                { value: nativeFee }
            )

            const receipt = await tx.wait()
            const event = receipt.events.find(e => e.event === 'WithdrawalInitiated')
            const guid = event.args.guid

            // Simulate withdrawal confirmation from other chain
            const confirmOptions = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            const [confirmFee] = await anyStakeB.quote(
                eidA,
                anyStakeA.OPERATION_WITHDRAW_SUCCESS(),
                TEST_AMOUNT,
                userA.address,
                anyStakeA.address,
                confirmOptions,
                false
            )

            await anyStakeB.connect(ownerB).send(
                eidA,
                userA.address,
                TEST_AMOUNT,
                true,
                { value: confirmFee }
            )

            // Verify withdrawal completion
            expect(await anyStakeA.lockedBalances(userA.address)).to.equal(0)
        })
    })

    describe('Cross-Chain Message Handling', function () {
        it('should handle composed messages correctly', async function () {
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            // Send a composed message
            const [nativeFee] = await anyStakeA.quote(
                eidB,
                anyStakeA.OPERATION_DEPOSIT(),
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )

            await anyStakeA.connect(userA).deposit(
                eidB,
                TEST_AMOUNT,
                anyStakeB.address,
                options,
                { value: nativeFee.add(TEST_AMOUNT) }
            )

            // Verify message handling
            expect(await anyStakeB.data()).to.include('Received DEPOSIT from user:')
        })
    })

    describe('Quote Functions', function () {
        it('should return correct deposit quote', async function () {
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            const [nativeFee] = await anyStakeA.quote(
                eidB,
                anyStakeA.OPERATION_DEPOSIT(),
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )

            expect(nativeFee).to.be.gt(0)
        })

        it('should return correct withdrawal quote', async function () {
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            const [nativeFee] = await anyStakeA.quote(
                eidB,
                anyStakeA.OPERATION_WITHDRAW(),
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )

            expect(nativeFee).to.be.gt(0)
        })
    })

    describe('Pending Withdrawal Management', function () {
        it('should correctly store and retrieve pending withdrawal', async function () {
            const options = Options.newOptions()
                .addExecutorLzReceiveOption(200000, 0)
                .toHex()
                .toString()

            // Initiate withdrawal
            const [nativeFee] = await anyStakeA.quote(
                eidB,
                anyStakeA.OPERATION_WITHDRAW(),
                TEST_AMOUNT,
                userA.address,
                anyStakeB.address,
                options,
                false
            )

            const tx = await anyStakeA.connect(userA).withdraw(
                eidB,
                TEST_AMOUNT,
                anyStakeB.address,
                options,
                { value: nativeFee }
            )

            const receipt = await tx.wait()
            const event = receipt.events.find(e => e.event === 'WithdrawalInitiated')
            const guid = event.args.guid

            // Verify pending withdrawal
            const pendingWithdrawal = await anyStakeA.getPendingWithdrawal(guid)
            expect(pendingWithdrawal.user).to.equal(userA.address)
            expect(pendingWithdrawal.amount).to.equal(TEST_AMOUNT)
            expect(pendingWithdrawal.exists).to.be.true
        })
    })
})