// 주차별 강의 목차 데이터
export const mockCourseOutline = {
  courseId: 'cs101',
  title: '자료구조',
  weeks: [
    {
      weekNumber: 1,
      title: '1주차: 배열과 연결 리스트',
      lectures: [
        {
          id: 'l1',
          title: '배열의 개념',
          durationSeconds: 1800,
          isCompleted: true,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
        {
          id: 'l2',
          title: '연결 리스트 기초',
          durationSeconds: 2400,
          isCompleted: true,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
        {
          id: 'l3',
          title: '이중 연결 리스트',
          durationSeconds: 2100,
          isCompleted: false,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
      ],
    },
    {
      weekNumber: 2,
      title: '2주차: 스택과 큐',
      lectures: [
        {
          id: 'l4',
          title: '스택의 개념과 구현',
          durationSeconds: 1950,
          isCompleted: false,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
        {
          id: 'l5',
          title: '큐의 개념과 구현',
          durationSeconds: 2250,
          isCompleted: false,
          videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        },
      ],
    },
  ],
}

export const mockChatMessages = [
  {
    id: 'm1',
    authorName: '이현규',
    content: '교수님, 연결 리스트 삭제 연산에서 포인터 처리가 헷갈립니다.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'm2',
    authorName: '김교수',
    content: '다음 강의에서 자세히 설명하겠습니다.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
]
