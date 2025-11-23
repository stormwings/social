# Social - Web3 Social Trading Platform

A Next.js 13+ Web3 social platform integrating Firebase authentication with Ethereum blockchain trading. Users can trade "keys" (bonding curve assets) via smart contracts, post content, and chat.

## Features

- **Dual Authentication**: MetaMask wallet sign-in or Google OAuth
- **Key Trading**: Buy/sell keys on bonding curves via USDT
- **Social Features**: Create posts, chat with other users
- **Real-time Updates**: Firestore listeners for live data synchronization
- **Multi-network Support**: Sepolia testnet (development) and LAChain (production)

## Tech Stack

- **Frontend**: Next.js 13+ (App Router), React 18, TypeScript, TailwindCSS
- **Authentication**: Firebase Auth (Google OAuth + Custom Tokens)
- **Database**: Firestore (real-time NoSQL)
- **Blockchain**: Ethereum (ethers.js v6)
- **UI Components**: Headless UI, Heroicons, Lottie animations

## Prerequisites

- Node.js 18.17.1+ (recommended: Node 20)
- Yarn 1.22.22
- Firebase project with Firestore enabled
- Ethereum wallet for server operations

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social
   ```

2. **Install dependencies**
   ```bash
   yarn
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Generate encryption key**
   ```bash
   openssl rand -hex 32
   ```
   Add this to `ENCRYPTION_KEY` in `.env.local`

5. **Start development server**
   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Server-side (API routes)

| Variable | Description |
|----------|-------------|
| `SERVICE_ACCOUNT` | Firebase Admin SDK service account JSON (entire JSON object as string) |
| `ENCRYPTION_KEY` | 32-byte hex key for AES-256-GCM encryption of generated wallets |
| `PRIVATE_KEY` | Server's Ethereum private key for automatic ETH top-ups |

### Client-side (public)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SOCIAL_MODE` | `"development"` (Sepolia) or `"production"` (LAChain) |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect project ID (optional) |
| `NEXT_PUBLIC_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_MEASUREMENT_ID` | Firebase measurement ID |

## Available Scripts

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Lint code
yarn lint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (serverless functions)
│   │   ├── token/         # Wallet signature verification
│   │   ├── setup/         # Account creation
│   │   ├── trade/         # Trading endpoints
│   │   ├── withdraw/      # USDT withdrawal
│   │   └── post/          # Post-related actions
│   ├── login/             # Login page
│   ├── deposit/           # Deposit page
│   ├── private/           # Protected routes (require auth)
│   │   ├── home/          # User feed
│   │   ├── explorer/      # Discover users
│   │   ├── posts/         # Posts management
│   │   ├── chats/         # Chat functionality
│   │   ├── account/       # User account settings
│   │   ├── withdraw/      # Withdraw funds
│   │   └── profile/       # User profiles
│   └── u/[username]/      # Public user profiles
├── components/
│   ├── dumb/              # Presentational components
│   ├── smart/             # Business logic components
│   ├── animations/        # Lottie animations
│   ├── AuthCheck.tsx      # Auth gate component
│   ├── Navbar.tsx         # Bottom navigation
│   └── Topbar.tsx         # Header components
├── lib/
│   ├── dappParams.ts      # Network & contract config
│   ├── firebase.js        # Firebase client SDK
│   ├── firebase-admin.js  # Firebase Admin SDK
│   ├── hooks.ts           # Custom React hooks
│   └── context.ts         # React context definitions
├── services/
│   └── trade.service.ts   # Trading business logic
├── usersKeysAbi.ts        # UsersKeys contract ABI
└── usdtTokenAbi.ts        # USDT token ABI
```

## Authentication Flows

### Wallet-based (Web3 users)
1. User connects MetaMask and signs a message
2. Server verifies signature and issues Firebase custom token
3. User controls their own private keys
4. Trading happens client-side with server validation

### Google OAuth (non-crypto users)
1. User signs in via Google
2. Server generates Ethereum wallet and encrypts private key
3. Private key stored in Firestore (AES-256-GCM encrypted)
4. Trading happens server-side

## Smart Contracts

### Networks

| Network | Chain ID | Mode |
|---------|----------|------|
| Sepolia Testnet | 11155111 | development |
| LAChain Testnet | 418 | production |

### Core Contracts

- **UsersKeys**: Bonding curve key trading
- **USDT**: ERC20 stablecoin for trading
- **SocialPost**: NFT minting for posts (not implemented)

## API Routes

All routes require `Authorization: Bearer {idToken}` header.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/token` | POST | Verify wallet signature, issue Firebase token |
| `/api/setup` | POST | Create account with generated wallet (Google users) |
| `/api/setup/wallet` | POST | Create account with existing wallet (Wallet users) |
| `/api/trade` | POST | Execute trade server-side (Google users) |
| `/api/trade/wallet` | POST | Validate trade, return params (Wallet users) |
| `/api/trade/wallet/confirm` | POST | Record completed client-side trade |
| `/api/withdraw` | POST | Withdraw USDT to external address |
| `/api/post/mint` | POST | Record post NFT mint |
| `/api/post/tip` | POST | Record tip sent to post |

## Database Schema (Firestore)

```
users/{uid}
├── username: string
├── ethereumAddress: string
├── holders: number
├── points: number
├── isWallet: boolean
├── posts/{postId}
│   ├── images: string[]
│   └── hearts: number
└── keys/{subjectUID}
    └── amount: number

usernames/{username}
└── uid: string

wallets/{uid}
└── encryptedPrivateKey: string  # Format: {iv}:{authTag}:{encrypted}

trades/{tradeId}
├── buyer/seller: string
├── subject: string
├── amount: number
├── price: number
└── txHash: string

chats/{chatId}  # Format: uid1-uid2 (sorted)
└── messages/{messageId}
    ├── sender: string
    ├── text: string
    └── timestamp: timestamp
```

## Custom Hooks

### Authentication
- `useSignInWithWallet()` - Sign in via MetaMask signature
- `useSignInWithGoogle()` - Sign in via Google OAuth
- `useUserData()` - Real-time user data from Firestore

### Blockchain
- `useBuyPrice(address)` - Get current buy price for 1 key
- `useSellPrice(address, amount)` - Get sell price for N keys
- `useKeyCount(subject, holder)` - Get key balance
- `useUsdtBalance(address)` - Poll USDT balance every 5s

### Utilities
- `useUsernameValidation()` - Check username availability
- `useDebounce()` - Debounce input values
- `useLocalStorage()` - Persist state to localStorage

## Security

- **Private Key Encryption**: AES-256-GCM encryption for stored keys
- **Token Verification**: All API routes verify Firebase ID tokens
- **Signature Verification**: Wallet addresses verified via ethers.verifyMessage()

## Development Notes

### Switching Networks

1. Update `SOCIAL_MODE` and `NEXT_PUBLIC_SOCIAL_MODE` in `.env.local`
2. Restart dev server
3. Contract addresses automatically selected from `dappParams.ts`

### Important Gotchas

1. Webpack fallbacks for ethers.js require `fs`, `net`, `tls` disabled in `next.config.js`
2. `ClientUserContextProvider` must be loaded with `{ ssr: false }` to prevent hydration mismatch
3. Check `isWallet` field to determine which trading API to call
4. USDT approval required before first trade (handled automatically)
5. Firebase ID tokens expire after 1 hour
6. Chat IDs must use sorted UIDs: `[uid1, uid2].sort().join('-')`

## Testing

- No automated test framework currently configured
- Manual testing via dev server recommended
- Test wallet and Google OAuth flows separately
- Verify trades on blockchain explorer
- Check Firestore console for data consistency

## Branch Strategy

- `master`: Main production branch (use for PRs)
- `staging`: Current development branch
- Create feature branches from `staging`, merge to `staging` first

## License

Private

## Contributing

1. Create a feature branch from `staging`
2. Make your changes
3. Submit a PR to `staging`
4. After review, changes will be merged to `master`
