import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { ChartDataPoint } from '@/lib/types';

Chart.register(...registerables);

interface WeightChartProps {
  data: ChartDataPoint[];
}

export function WeightChart({ data }: WeightChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Weight (kg)',
          data: data.map(d => d.value),
          borderColor: 'hsl(var(--secondary))',
          backgroundColor: 'hsl(var(--secondary) / 0.1)',
          tension: 0.4,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            grid: {
              color: 'hsl(var(--border))',
            },
            ticks: {
              color: 'hsl(var(--muted-foreground))',
            }
          },
          x: {
            grid: {
              color: 'hsl(var(--border))',
            },
            ticks: {
              color: 'hsl(var(--muted-foreground))',
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="chart-container">
      <canvas ref={chartRef} />
    </div>
  );
}
