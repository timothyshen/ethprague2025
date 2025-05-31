import { expect } from 'chai'
import { ethers } from 'hardhat'
import '@nomicfoundation/hardhat-chai-matchers'

describe('AnyStake', function () {
    let anyStake: any
    let mockEndpoint: any
    let owner: any
    let user: any
    let delegate: any

    beforeEach(async function () {
        [owner, user, , delegate] = await ethers.getSigners()
        // Deploy MockEndpoint
        const MockEndpoint = await ethers.getContractFactory('MockEndpoint')
        mockEndpoint = await MockEndpoint.deploy()
        await mockEndpoint.deployed()
        // Deploy AnyStake with mockEndpoint and delegate
        const AnyStake = await ethers.getContractFactory('AnyStake')
        anyStake = await AnyStake.deploy(mockEndpoint.address, await delegate.getAddress())
        await anyStake.deployed()
        // Set delegate in MockEndpoint if needed
        await mockEndpoint.setDelegate(await delegate.getAddress())
    })

    it('should allow deposit and emit events', async function () {
        const depositAmount = ethers.utils.parseEther('1')
        const dstEid = 1
        const composedAddress = ethers.constants.AddressZero
        const options = '0x'

        // Call deposit
        const tx = await anyStake.connect(user).deposit(
            dstEid,
            depositAmount,
            composedAddress,
            options,
            { value: depositAmount.mul(2) } // Overpay to satisfy fee check
        )
        const receipt = await tx.wait()
        // Check event
        const event = receipt.events?.find((e: any) => e.event === 'Deposited')
        expect(event).to.not.be.undefined
        expect(event?.args?.user.toLowerCase()).to.equal((await user.getAddress()).toLowerCase())
        expect(event?.args?.amount.toString()).to.equal(depositAmount.toString())
        // Check balance
        const locked = await anyStake.lockedBalances(await user.getAddress())
        expect(locked.toString()).to.equal(depositAmount.toString())
    })

    it('should not allow deposit of zero', async function () {
        const dstEid = 1
        const composedAddress = ethers.constants.AddressZero
        const options = '0x'
        await expect(
            anyStake.connect(user).deposit(dstEid, 0, composedAddress, options, { value: 0 })
        ).to.be.reverted
    })

    it('should not allow withdraw more than locked', async function () {
        const withdrawAmount = ethers.utils.parseEther('1')
        const dstEid = 1
        const composedAddress = ethers.constants.AddressZero
        const options = '0x'
        await expect(
            anyStake.connect(user).withdraw(dstEid, withdrawAmount, composedAddress, options, { value: 0 })
        ).to.be.reverted
    })

    // Add more tests for withdraw, pendingWithdrawals, etc. as needed
})
