// 마감 임박(24시간 이내), 일반, 마감된 과제 포함
export const mockAssignments = [
  {
    id: 'a1',
    title: '자료구조 과제 1',
    courseName: '자료구조',
    dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 현재+12시간
    isSubmitted: false,
  },
  {
    id: 'a2',
    title: '알고리즘 과제 2',
    courseName: '알고리즘',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 현재+3일
    isSubmitted: false,
  },
  {
    id: 'a3',
    title: '운영체제 과제 1',
    courseName: '운영체제',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 현재+7일
    isSubmitted: false,
  },
  {
    id: 'a4',
    title: '데이터베이스 과제 1',
    courseName: '데이터베이스',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 현재-1일 (마감)
    isSubmitted: false,
  },
]
