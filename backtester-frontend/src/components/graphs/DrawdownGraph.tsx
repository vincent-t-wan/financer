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

interface DrawdownPoint {
  date: string;
  drawdown: number;
  [key: string]: number | string;
}

interface DrawdownGraphProps {
  data: DrawdownPoint[];
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

const MaxDD = styled.span`
  color: #ef4444;
  font-size: 22px;
  font-weight: 600;
`;

const Label = styled.span`
  color: #4a5568;
  font-size: 11px;
`;

const TooltipBox = styled.div`
  background: #161822;
  border: 1px solid #2a2f40;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;

  .lbl { color: #8892a4; margin-bottom: 4px; }
  .val { color: #ef4444; font-weight: 600; }
`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <TooltipBox>
      <div className="lbl">{label}</div>
      <div className="val">{payload[0].value.toFixed(2)}%</div>
    </TooltipBox>
  );
};

export const DrawdownGraph: React.FC<DrawdownGraphProps> = ({
  data
}) => {
  const values = data.map((d) => Number(d["drawdown"]));
  const maxDD = Math.min(...values);

  return (
    <Card>
      <Header>
        <Title>{"Drawdown"}</Title>
        <MaxDD>{maxDD.toFixed(2)}%</MaxDD>
        <Label>max drawdown</Label>
      </Header>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="ddGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1e2230" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={"date"}
            tick={{ fill: "#4a5568", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#4a5568", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={50}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#2a2f40" />
          <ReferenceLine
            y={maxDD}
            stroke="#ef444466"
            strokeDasharray="4 4"
            label={{ value: `${maxDD.toFixed(1)}%`, fill: "#ef4444", fontSize: 10, position: "insideTopLeft" }}
          />
          <Area
            type="monotone"
            dataKey={"drawdown"}
            stroke="#ef4444"
            strokeWidth={1.5}
            fill="url(#ddGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#ef4444", stroke: "#0d0f14", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DrawdownGraph;