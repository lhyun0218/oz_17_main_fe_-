interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  borderColor: 'blue' | 'yellow' | 'green' | 'red'
}

const borderColorMap: Record<StatCardProps['borderColor'], string> = {
  blue: 'border-t-blue-400',
  yellow: 'border-t-yellow-400',
  green: 'border-t-green-400',
  red: 'border-t-red-400',
}

const StatCard = ({ title, value, subtitle, borderColor }: StatCardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border-t-4 ${borderColorMap[borderColor]} p-5 flex flex-col gap-1`}
    >
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  )
}

export default StatCard
