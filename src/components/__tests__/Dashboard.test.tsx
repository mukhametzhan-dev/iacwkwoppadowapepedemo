import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Page', () => {
  test('renders dashboard page', () => {
    const { container } = renderDashboard();
    expect(container).toBeTruthy();
  });

  test('contains dashboard title', () => {
    const { getByText } = renderDashboard();
    expect(getByText('Meme-Coin Dashboard')).toBeInTheDocument();
  });

  test('renders all four main cards', () => {
    const { getByText } = renderDashboard();
    expect(getByText('Trend Radar')).toBeInTheDocument();
    expect(getByText('Concept Showcase')).toBeInTheDocument();
    expect(getByText('Analytics Hub')).toBeInTheDocument();
    expect(getByText('Launch Token')).toBeInTheDocument();
  });
});