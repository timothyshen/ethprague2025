// Get the environment configuration from .env file
//
// To make use of automatic environment setup:
// - Duplicate .env.example file and name it .env
// - Fill in the environment variables
import 'dotenv/config'

import 'hardhat-deploy'
import 'hardhat-contract-sizer'
import '@nomiclabs/hardhat-ethers'
import '@layerzerolabs/toolbox-hardhat'
import { HardhatUserConfig, HttpNetworkAccountsUserConfig } from 'hardhat/config'

import { EndpointId } from '@layerzerolabs/lz-definitions'

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts: HttpNetworkAccountsUserConfig | undefined = PRIVATE_KEY

if (accounts == null) {
    console.warn(
        'Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example.'
    )
}

const config: HardhatUserConfig = {
    paths: {
        cache: 'cache/hardhat',
    },
    solidity: {
        compilers: [
            {
                version: '0.8.22',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        'hedera-testnet': {
            eid: EndpointId.HEDERA_V2_TESTNET,
            url: process.env.RPC_URL_HEDERA_TESTNET || 'https://testnet.hashio.io/api',
            accounts: [process.env.PRIVATE_KEY || ''],
        },
        'flow-testnet': {
            eid: EndpointId.FLOW_V2_TESTNET,
            url: process.env.RPC_URL_FUJI || 'https://flow-testnet.g.alchemy.com/v2/RZJ-p0JGsmg8yN4Kk5ysF',
            accounts: [process.env.PRIVATE_KEY || ''],
        },
        'ethereum-sepolia': {
            eid: EndpointId.SEPOLIA_V2_TESTNET,
            url: process.env.RPC_URL_ETH_SEPOLIA || 'https://eth-sepolia.g.alchemy.com/v2/RZJ-p0JGsmg8yN4Kk5ysF',
            accounts: [process.env.PRIVATE_KEY || ''],
        },
        // 'arbitrum-testnet': {
        //     eid: EndpointId.ARBSEP_V2_TESTNET,
        //     url: process.env.RPC_URL_ARB_SEPOLIA || '',
        //     accounts,
        // },
        hardhat: {
            // Need this for testing because TestHelperOz5.sol is exceeding the compiled contract size limit
            allowUnlimitedContractSize: true,
            accounts: {
                accountsBalance: '10000000000000000000000', // 10000 ETH
            },
        },
    },
    namedAccounts: {
        deployer: {
            default: 0, // wallet address of index[0], of the mnemonic in .env
        },
    },
}

export default config
