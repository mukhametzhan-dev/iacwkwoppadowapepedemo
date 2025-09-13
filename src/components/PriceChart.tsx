import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PricePoint {
  t: string;
  p: number;
}

interface PriceChartProps {
  data: PricePoint[];
  symbol: string;
  className?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  symbol,
  className = '',
}) => {
  // Transform data for recharts
  const chartData = data.map((point) => ({
    time: new Date(point.t).getTime(),
    price: point.p,
    formattedTime: new Date(point.t).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: data.length > 10 ? undefined : '2-digit',
    }),
  }));

  const formatPrice = (value: number) => {
    if (value < 0.000001) {
      return value.toExponential(2);
    } else if (value < 0.001) {
      return value.toFixed(8);
    } else if (value < 1) {
      return value.toFixed(6);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(value);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const date = new Date(data.payload.time);
      
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-sm font-semibold">
            <span className="text-muted-foreground">{symbol}: </span>
            <span className="text-primary">{formatPrice(data.value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="formattedTime"
            axisLine={false}
            tickLine={false}
            className="text-xs text-muted-foreground"
          />
          <YAxis
            tickFormatter={formatPrice}
            axisLine={false}
            tickLine={false}
            className="text-xs text-muted-foreground"
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: 'hsl(var(--primary))',
              strokeWidth: 2,
              stroke: 'hsl(var(--background))',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};