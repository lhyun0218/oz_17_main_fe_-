import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface AttendanceGaugeProps {
  rate: number // 0~100
  attendedCount: number
  totalCount: number
}

const AttendanceGauge = ({ rate, attendedCount, totalCount }: AttendanceGaugeProps) => {
  const isWarning = rate < 75
  const clampedRate = Math.min(100, Math.max(0, rate))

  // 반원형 게이지: 상단 반원만 사용 (startAngle=180, endAngle=0)
  const data = [
    { value: clampedRate },
    { value: 100 - clampedRate },
  ]

  const gaugeColor = isWarning ? '#ef4444' : '#22c55e'

  return (
    <div className="bg-white rounded-xl shadow-sm border-t-4 border-t-green-400 p-5 flex flex-col items-center">
      <p className="text-sm text-gray-500 font-medium self-start">출석률</p>
      <div className="relative w-full" style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={gaugeColor} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* 중앙 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span
            className="text-2xl font-bold"
            style={{ color: gaugeColor }}
          >
            {clampedRate.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400">
            {attendedCount}/{totalCount}회
          </span>
        </div>
      </div>
      {isWarning && (
        <p className="mt-1 text-xs font-semibold text-red-500">출석률 주의</p>
      )}
    </div>
  )
}

export default AttendanceGauge
