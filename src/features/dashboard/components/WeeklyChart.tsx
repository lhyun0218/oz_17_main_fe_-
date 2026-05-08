import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { WeeklyStudyData } from '../types'

interface WeeklyChartProps {
  data: WeeklyStudyData[]
}

const DAY_LABELS: Record<number, string> = {
  0: '일',
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
  6: '토',
}

const WeeklyChart = ({ data }: WeeklyChartProps) => {
  const today = new Date().toISOString().split('T')[0]

  const chartData = data.map((item) => {
    const dayOfWeek = new Date(item.date + 'T00:00:00').getDay()
    return {
      date: item.date,
      label: DAY_LABELS[dayOfWeek],
      hours: +(item.studyMinutes / 60).toFixed(1),
    }
  })

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 h-full">
      <h2 className="text-base font-semibold text-gray-700 mb-4">이번 주 학습 현황</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barCategoryGap="30%">
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}h`}
            width={32}
          />
          <Tooltip
            formatter={(value) => [`${value}시간`, '학습 시간']}
            labelFormatter={(label) => `${label}요일`}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell
                key={entry.date}
                fill={entry.date === today ? '#ef4444' : '#6366f1'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeeklyChart
