import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import styled from "styled-components";

interface EquityPoint {
  date: string;
  value: number;
  [key: string]: number | string;
}

interface EquityGraphProps {
  data: EquityPoint[];
  valueKey?: string;
  labelKey?: string;
  title?: string;
  height?: number;
}

const Card = styled.div`
  background: #0d0f14;
  border: 1px solid #1e2230;
  border-radius: 12px;
  padding: 24px;
  font-family: "IBM Plex Mono", "Fira Code", monospace;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
`;

const Title = styled.span`
  color: #8892a4;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const CurrentValue = styled.span`
  color: #e2e8f0;
  font-size: 22px;
  font-weight: 600;
`;

const Delta = styled.span<{ positive: boolean }>`
  font-size: 12px;
  color: ${({ positive }) => (positive ? "#22c55e" : "#ef4444")};
`;

const CustomTooltipWrapper = styled.div`
  background: #161822;
  border: 1px solid #2a2f40;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: #e2e8f0;

  .label {
    color: #8892a4;
    margin-bottom: 4px;
  }
  .val {
    color: #38bdf8;
    font-weight: 600;
  }
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <CustomTooltipWrapper>
      <div className="label">{label}</div>
      <div className="val">{payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
    </CustomTooltipWrapper>
  );
};

export const EquityGraph: React.FC<EquityGraphProps> = ({
  data,
  valueKey = "value",
  labelKey = "date",
  title = "Equity Curve",
  height = 260,
}) => {
  const values = data.map((d) => Number(d[valueKey]));
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const deltaAbs = last - first;
  const deltaPct = first !== 0 ? (deltaAbs / first) * 100 : 0;
  const positive = deltaAbs >= 0;

  return (
    <Card>
      <Header>
        <Title>{title}</Title>
        <CurrentValue>{last.toLocaleString(undefined, { maximumFractionDigits: 2 })}</CurrentValue>
        <Delta positive={positive}>
          {positive ? "▲" : "▼"} {Math.abs(deltaPct).toFixed(2)}%
        </Delta>
      </Header>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2230" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={labelKey}
            tick={{ fill: "#4a5568", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#4a5568", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(v) => v.toLocaleString(undefined, { notation: "compact" })}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={first} stroke="#2a2f40" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey={valueKey}
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#equityGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#38bdf8", stroke: "#0d0f14", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default EquityGraph;