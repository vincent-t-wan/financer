import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from "recharts";
import styled from "styled-components";

interface DailyReturnsPoint {
  date: string;
  value: number;
  [key: string]: number | string;
}

interface DailyReturnsGraphProps {
  data: DailyReturnsPoint[];
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
  gap: 16px;
  margin-bottom: 20px;
`;

const Title = styled.span`
  color: #8892a4;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const Stat = styled.span<{ color?: string }>`
  font-size: 12px;
  color: ${({ color }) => color ?? "#8892a4"};
`;

const TooltipBox = styled.div`
  background: #161822;
  border: 1px solid #2a2f40;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  .lbl { color: #8892a4; margin-bottom: 4px; }
  .val { font-weight: 600; }
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  return (
    <TooltipBox>
      <div className="lbl">{label}</div>
      <div className="val" style={{ color: v >= 0 ? "#22c55e" : "#ef4444" }}>
        {v >= 0 ? "+" : ""}{(v * 100).toFixed(3)}%
      </div>
    </TooltipBox>
  );
};

export const DailyReturnsGraph: React.FC<DailyReturnsGraphProps> = ({
  data
}) => {
  const values = data.map((d) => Number(d["value"]));
  const chartData = values.map((v, i) => ({
    label: data[i]?.["date"] ?? String(i + 1),
    return: v,
  }));

  const pos = values.filter((v) => v >= 0).length;
  const neg = values.length - pos;
  const winRate = values.length > 0 ? ((pos / values.length) * 100).toFixed(1) : "—";
  const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  return (
    <Card>
      <Header>
        <Title>{"Daily Returns"}</Title>
        <Stat color="#22c55e">▲ {pos} days</Stat>
        <Stat color="#ef4444">▼ {neg} days</Stat>
        <Stat color="#8892a4">win {winRate}%</Stat>
        <Stat color={mean >= 0 ? "#22c55e" : "#ef4444"}>
          avg {mean >= 0 ? "+" : ""}{(mean * 100).toFixed(3)}%
        </Stat>
      </Header>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="20%">
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
            width={55}
            tickFormatter={(v) => `${(v * 100).toFixed(1)}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e2230" }} />
          <ReferenceLine y={0} stroke="#2a2f40" />
          <Bar dataKey="return" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.return >= 0 ? "#22c55e" : "#ef4444"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DailyReturnsGraph;