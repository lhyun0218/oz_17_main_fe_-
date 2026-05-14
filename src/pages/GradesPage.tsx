import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/axios'
import { gradeToGpa } from '../mocks/fixtures/db'
import SkeletonCard from '../shared/components/SkeletonCard'

interface GradeApiItem {
  courseId: string
  courseName: string
  professorName: string
  credits: number
  semester: string
  score: number | null
  gradeStr: string | null
  gpa: number | null
}

const gradeColors: Record<string, string> = {
  'A+': 'bg-green-100 text-green-700',
  'A':  'bg-green-100 text-green-600',
  'B+': 'bg-blue-100 text-blue-700',
  'B':  'bg-blue-100 text-blue-600',
  'C+': 'bg-yellow-100 text-yellow-700',
  'C':  'bg-yellow-100 text-yellow-600',
  'D+': 'bg-orange-100 text-orange-700',
  'D':  'bg-orange-100 text-orange-600',
  'F':  'bg-red-100 text-red-700',
}

export default function GradesPage() {
  const { data: grades, isLoading, isError } = useQuery<GradeApiItem[]>({
    queryKey: ['grades'],
    queryFn: async () => {
      const res = await apiClient.get<GradeApiItem[]>('/grades')
      return res.data
    },
    staleTime: 0, // 항상 최신 데이터 사용
  })

  if (isError) {
    return (
      <div className="p-8 flex items-center justify-center">
        <p className="text-gray-500">성적 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  // 성적이 있는 과목만 GPA 계산에 포함
  const gradedItems = grades?.filter((g) => g.gradeStr !== null) ?? []
  const totalCredits = grades?.reduce((s, g) => s + g.credits, 0) ?? 0
  const gradedCredits = gradedItems.reduce((s, g) => s + g.credits, 0)
  const earnedCredits = gradedItems.filter((g) => g.gradeStr !== 'F').reduce((s, g) => s + g.credits, 0)
  const gpa = gradedCredits > 0
    ? Math.round(gradedItems.reduce((s, g) => s + gradeToGpa(g.gradeStr!) * g.credits, 0) / gradedCredits * 100) / 100
    : 0

  return (
    <div className="p-6 flex flex-col gap-6 max-w-screen-2xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">성적 / 학점</h1>
        <p className="mt-1 text-sm text-gray-500">현재 학기 성적 및 학점 현황입니다.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-t-indigo-400">
              <p className="text-sm text-gray-500 font-medium">평균 평점 (GPA)</p>
              <p className="text-4xl font-bold text-indigo-600 mt-1">{gpa.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">4.5 만점</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-t-blue-400">
              <p className="text-sm text-gray-500 font-medium">이수 학점</p>
              <p className="text-4xl font-bold text-blue-600 mt-1">{earnedCredits}</p>
              <p className="text-xs text-gray-400 mt-1">학점</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5 border-t-4 border-t-gray-400">
              <p className="text-sm text-gray-500 font-medium">신청 학점</p>
              <p className="text-4xl font-bold text-gray-600 mt-1">{totalCredits}</p>
              <p className="text-xs text-gray-400 mt-1">학점</p>
            </div>
          </div>

          {/* 강의별 성적 테이블 */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-700">강의별 성적</h2>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">강의명</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">담당 교수</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">학점</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">점수</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">등급</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">평점</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {grades?.map((g) => (
                  <tr key={g.courseId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{g.courseName}</td>
                    <td className="px-4 py-3 text-gray-500">{g.professorName}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{g.credits}학점</td>
                    <td className="px-4 py-3 text-center">
                      {g.score !== null ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-400" style={{ width: `${g.score}%` }} />
                          </div>
                          <span className="text-gray-600 w-8 text-right">{g.score}</span>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs">미입력</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {g.gradeStr ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gradeColors[g.gradeStr] ?? 'bg-gray-100 text-gray-600'}`}>
                          {g.gradeStr}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-indigo-600">
                      {g.gradeStr ? gradeToGpa(g.gradeStr).toFixed(1) : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              {gradedItems.length > 0 && (
                <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-gray-700">합계 / 평균</td>
                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-700">{totalCredits}학점</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                      {gradedItems.length > 0
                        ? Math.round(gradedItems.reduce((s, g) => s + (g.score ?? 0), 0) / gradedItems.length)
                        : 0}점
                    </td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-center text-sm font-bold text-indigo-600">{gpa.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
