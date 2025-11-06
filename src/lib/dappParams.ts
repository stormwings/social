
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
    CHAIN_ID = 418;
    RPC_ENDPOINT = 'https://rpc.testnet.lachain.network';
    usersKeysAddress = '0xAc8a31177dA73a1d82976676e4Fa70CF7BB00Fbb';
    usdtAddress = '0xf6Ca7FD7722b5Fa683788aE56b82df3501B54386';
    socialPostAddress = '0x6B77F6200b9567B559D106F5cc747Bd3248fF91B';
    GAS_PRICE = 10000000;
} else if (MODE == 'production') {
    CHAIN_ID = 418;
    RPC_ENDPOINT = 'https://rpc.testnet.lachain.network';
    usersKeysAddress = '0xAc8a31177dA73a1d82976676e4Fa70CF7BB00Fbb';
    usdtAddress = '0xf6Ca7FD7722b5Fa683788aE56b82df3501B54386';
    socialPostAddress = '0x6B77F6200b9567B559D106F5cc747Bd3248fF91B';
    GAS_PRICE = 10000000;
} else {
    throw new Error('set SOCIAL_MODE to development or production');
}

export { usersKeysAddress, usdtAddress, socialPostAddress, RPC_ENDPOINT, GAS_PRICE, CHAIN_ID, PRIVATE_KEY };
