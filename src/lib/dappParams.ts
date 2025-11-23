
let usersKeysAddress: string;
let usdtAddress: string;
let socialPostAddress: string;
let RPC_ENDPOINT: string;
let CHAIN_ID: number;
let GAS_PRICE = 5000000000000;
let PRIVATE_KEY: string = process.env.PRIVATE_KEY || ''

const MODE = process.env.SOCIAL_MODE || process.env.NEXT_PUBLIC_SOCIAL_MODE;
console.log("MODE", MODE)

if (MODE == 'development') {
    CHAIN_ID = 11155111;
    RPC_ENDPOINT = 'https://eth-sepolia.g.alchemy.com/v2/';
    usersKeysAddress = '';
    usdtAddress = '';
    socialPostAddress = '';
    GAS_PRICE = 10000000;
} else if (MODE == 'production') {
    CHAIN_ID = 418;
    RPC_ENDPOINT = 'https://eth-sepolia.g.alchemy.com/v2/';
    usersKeysAddress = '';
    usdtAddress = '';
    socialPostAddress = '';
    GAS_PRICE = 10000000;
} else {
    throw new Error('set SOCIAL_MODE to development or production');
}

export { usersKeysAddress, usdtAddress, socialPostAddress, RPC_ENDPOINT, GAS_PRICE, CHAIN_ID, PRIVATE_KEY };
