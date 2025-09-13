import '@testing-library/jest-dom';

// Mock Solana wallet adapter modules
jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: () => ({
    connection: {
      getBalance: jest.fn().mockResolvedValue(1000000000), // 1 SOL in lamports
    },
  }),
  useWallet: () => ({
    publicKey: null,
    connected: false,
    connecting: false,
  }),
}));

jest.mock('@solana/wallet-adapter-react-ui', () => ({
  WalletMultiButton: ({ children, ...props }: any) => (
    <button {...props}>{children || 'Connect Wallet'}</button>
  ),
}));

// Mock CSS imports
jest.mock('@solana/wallet-adapter-react-ui/styles.css', () => {});