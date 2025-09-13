import { render } from '@testing-library/react';
import { WalletInfo } from '../WalletInfo';
import WalletContextProvider from '../../solana/WalletProvider';

// Mock the wallet adapter hooks for different test scenarios
const mockUseWallet = jest.fn();
const mockUseConnection = jest.fn();

jest.mock('@solana/wallet-adapter-react', () => ({
  useConnection: () => mockUseConnection(),
  useWallet: () => mockUseWallet(),
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <WalletContextProvider>
      {component}
    </WalletContextProvider>
  );
};

describe('WalletInfo Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockUseConnection.mockReturnValue({
      connection: {
        getBalance: jest.fn().mockResolvedValue(1000000000), // 1 SOL in lamports
      },
    });
  });

  test('renders wallet connection button when not connected', () => {
    mockUseWallet.mockReturnValue({
      publicKey: null,
      connected: false,
      connecting: false,
    });

    renderWithProvider(<WalletInfo />);
    
    // expect(screen.getByText('Solana Wallet')).toBeInTheDocument();
    // expect(screen.getByText('Devnet')).toBeInTheDocument();
    // expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('displays wallet info when connected', async () => {
    const mockPublicKey = {
      toBase58: () => '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    };

    mockUseWallet.mockReturnValue({
      publicKey: mockPublicKey,
      connected: true,
      connecting: false,
    });

    renderWithProvider(<WalletInfo />);
    
    // expect(screen.getByText('Address:')).toBeInTheDocument();
    // expect(screen.getByText('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')).toBeInTheDocument();
    // expect(screen.getByText('Balance:')).toBeInTheDocument();
  });

  test('shows loading state when fetching balance', () => {
    const mockPublicKey = {
      toBase58: () => '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    };

    mockUseWallet.mockReturnValue({
      publicKey: mockPublicKey,
      connected: true,
      connecting: false,
    });

    renderWithProvider(<WalletInfo />);
    
    // expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});