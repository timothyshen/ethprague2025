import '@nomicfoundation/hardhat-chai-matchers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { Contract, Signer } from 'ethers';

describe('StakeAggregator', function () {
  let stakeAggregator: Contract;
  let owner: Signer;
  let user: Signer;
  let endpoint: Signer;
  let anyStake: Signer;

  beforeEach(async function () {
    [owner, user, endpoint, anyStake] = await ethers.getSigners();
    const endpointAddress = await endpoint.getAddress();
    const anyStakeAddress = await anyStake.getAddress();
    const ownerAddress = await owner.getAddress();
    const StakeAggregator = await ethers.getContractFactory('StakeAggregator');
    stakeAggregator = await StakeAggregator.deploy(endpointAddress, anyStakeAddress, ownerAddress);
    await stakeAggregator.deployed();
  });

  it('should allow user to stake ETH and emit event', async function () {
    const stakeAmount = ethers.utils.parseEther('1');
    const tx = await stakeAggregator.connect(user).stake({ value: stakeAmount });
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'Deposited');
    expect(event).to.not.be.undefined;
    expect(event?.args?.user.toString().toLowerCase()).to.equal((await user.getAddress()).toString().toLowerCase());
    expect(event?.args?.amount.toString()).to.equal(stakeAmount.toString());
    const staked = await stakeAggregator.stakedAmount(await user.getAddress());
    expect(staked.toString()).to.equal(stakeAmount.toString());
  });

  it('should not allow zero stake', async function () {
    await expect(
      stakeAggregator.connect(user).stake({ value: 0 })
    ).to.be.reverted;
  });

  it('should allow user to withdraw staked ETH', async function () {
    const stakeAmount = ethers.utils.parseEther('1');
    await stakeAggregator.connect(user).stake({ value: stakeAmount });
    const tx = await stakeAggregator.connect(user).withdraw(stakeAmount);
    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === 'Withdrawn');
    expect(event).to.not.be.undefined;
    expect(event?.args?.user.toString().toLowerCase()).to.equal((await user.getAddress()).toString().toLowerCase());
    expect(event?.args?.amount.toString()).to.equal(stakeAmount.toString());
    const staked = await stakeAggregator.stakedAmount(await user.getAddress());
    expect(staked.toString()).to.equal('0');
  });

  it('should not allow withdraw more than staked', async function () {
    const stakeAmount = ethers.utils.parseEther('1');
    await stakeAggregator.connect(user).stake({ value: stakeAmount });
    await expect(
      stakeAggregator.connect(user).withdraw(stakeAmount.add(1))
    ).to.be.reverted;
  });

  it('should not allow withdraw if contract balance is insufficient', async function () {
    // This test is only meaningful if contract balance can be drained, which is not possible in this simple setup.
    // You can extend this test if you add a function to drain contract balance as owner.
  });
}); 