import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PieChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
    }>;
  };
  title?: string;
  height?: number;
}

const PieChart = ({ data, title, height = 300 }: PieChartProps) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: title ? {
        display: true,
        text: title
      } : undefined,
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Pie data={data} options={defaultOptions} />
    </div>
  );
};

export default PieChart;

