import { type DeployFunction } from 'hardhat-deploy/types'

const contractName = 'StakeAggregator'

const deploy: DeployFunction = async (hre) => {
    const { getNamedAccounts, deployments } = hre

    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const anyStakeDeployment = await hre.deployments.get('AnyStake')
    const endpointV2Deployment = await hre.deployments.get('EndpointV2')

    const { address } = await deploy(contractName, {
        from: deployer,
        args: [endpointV2Deployment.address, anyStakeDeployment.address, deployer],
        log: true,
        skipIfAlreadyDeployed: false,
    })

    console.log(`Network: ${hre.network.name}`)
    console.log(`Deployer: ${deployer}`)
    console.log(`Deployed contract: ${contractName}, network: ${hre.network.name}, address: ${address}`)
}

deploy.tags = [contractName]

export default deploy
