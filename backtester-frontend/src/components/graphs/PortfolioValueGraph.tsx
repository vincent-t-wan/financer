import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import styled from "styled-components";

interface PortfolioPoint {
  date: string;
  value: number;
  [key: string]: number | string;
}

interface PortfolioValueGraphProps {
  data: PortfolioPoint[];
  labels?: string[];
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

const Pnl = styled.span<{ positive: boolean }>`
  font-size: 12px;
  color: ${({ positive }) => (positive ? "#22c55e" : "#ef4444")};
`;

const TooltipBox = styled.div`
  background: #161822;
  border: 1px solid #2a2f40;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  .lbl { color: #8892a4; margin-bottom: 4px; }
  .val { color: #a78bfa; font-weight: 600; }
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <div className="lbl">{label}</div>
      <div className="val">
        {Number(payload[0].value).toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
      </div>
    </TooltipBox>
  );
};

export const PortfolioValueGraph: React.FC<PortfolioValueGraphProps> = ({
  data,
  height = 260,
}) => {
  const values = data.map((d) => Number(d["value"]));
  const chartData = values.map((v, i) => ({
    label: data[i]?.["date"] ?? String(i + 1),
    value: v,
  }));

  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const pnl = last - first;
  const pnlPct = first !== 0 ? (pnl / first) * 100 : 0;
  const positive = pnl >= 0;

  return (
    <Card>
      <Header>
        <Title>{"Portfolio Value"}</Title>
        <CurrentValue>
          {last.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })}
        </CurrentValue>
        <Pnl positive={positive}>
          {positive ? "▲" : "▼"} {Math.abs(pnlPct).toFixed(2)}%
          {" "}({positive ? "+" : ""}{pnl.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 })})
        </Pnl>
      </Header>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1e2230" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#4a5568", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#4a5568", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={65}
            tickFormatter={(v) =>
              v.toLocaleString(undefined, { notation: "compact", style: "currency", currency: "USD", maximumFractionDigits: 0 })
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={first} stroke="#2a2f40" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#a78bfa"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#a78bfa", stroke: "#0d0f14", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PortfolioValueGraph;