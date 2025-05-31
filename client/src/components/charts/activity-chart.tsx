import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { WeeklyActivityData } from '@/lib/types';

Chart.register(...registerables);

interface ActivityChartProps {
  data: WeeklyActivityData[];
}

export function ActivityChart({ data }: ActivityChartProps) {
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
        labels: data.map(d => d.day),
        datasets: [{
          label: 'Calories Burned',
          data: data.map(d => d.calories),
          borderColor: 'hsl(var(--primary))',
          backgroundColor: 'hsl(var(--primary) / 0.1)',
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
            beginAtZero: true,
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
