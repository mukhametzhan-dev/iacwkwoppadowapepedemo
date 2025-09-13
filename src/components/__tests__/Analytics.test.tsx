import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Analytics from '@/pages/Analytics';

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

const renderAnalytics = () => {
  return render(
    <BrowserRouter>
      <Analytics />
    </BrowserRouter>
  );
};

describe('Analytics Page', () => {
  test('renders analytics page', () => {
    const { container } = renderAnalytics();
    expect(container).toBeTruthy();
  });
});