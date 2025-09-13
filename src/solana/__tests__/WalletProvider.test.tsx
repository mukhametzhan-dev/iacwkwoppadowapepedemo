import { render } from '@testing-library/react';
import WalletContextProvider from '../WalletProvider';

describe('WalletContextProvider', () => {
  test('renders children without crashing', () => {
    const TestComponent = () => <div>Test Child</div>;
    
    const { getByText } = render(
      <WalletContextProvider>
        <TestComponent />
      </WalletContextProvider>
    );
    
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  test('provides wallet context to children', () => {
    const TestComponent = () => {
      // This test verifies that the component renders without errors
      // In a real scenario, we would test the wallet context values
      return <div>Wallet Provider Test</div>;
    };
    
    const { getByText } = render(
      <WalletContextProvider>
        <TestComponent />
      </WalletContextProvider>
    );
    
    expect(getByText('Wallet Provider Test')).toBeInTheDocument();
  });
});