import assert from 'assert'

import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'StakeAggregator'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    assert(deployer, 'Missing named deployer account')

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)
}

deploy.tags = [contractName]

export default deploy
