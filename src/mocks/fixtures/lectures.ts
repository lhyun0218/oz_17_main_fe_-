import type { CourseOutline } from '../../features/lecture/types'

// 강의별 목차 데이터 (courseId별로 구분)
export const mockCourseOutlines: Record<string, CourseOutline> = {
  cs101: {
    courseId: 'cs101',
    title: '자료구조',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 배열과 연결 리스트',
        lectures: [
          { id: 'cs101-l1', title: '배열의 개념', durationSeconds: 1800, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs101-l2', title: '연결 리스트 기초', durationSeconds: 2400, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs101-l3', title: '이중 연결 리스트', durationSeconds: 2100, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 스택과 큐',
        lectures: [
          { id: 'cs101-l4', title: '스택의 개념과 구현', durationSeconds: 1950, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs101-l5', title: '큐의 개념과 구현', durationSeconds: 2250, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  cs201: {
    courseId: 'cs201',
    title: '알고리즘',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 알고리즘 기초',
        lectures: [
          { id: 'cs201-l1', title: '알고리즘이란?', durationSeconds: 1500, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs201-l2', title: '시간 복잡도 분석', durationSeconds: 2700, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 정렬 알고리즘',
        lectures: [
          { id: 'cs201-l3', title: '버블 정렬', durationSeconds: 1800, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs201-l4', title: '퀵 정렬', durationSeconds: 2400, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs201-l5', title: '병합 정렬', durationSeconds: 2100, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  cs301: {
    courseId: 'cs301',
    title: '운영체제',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 운영체제 개요',
        lectures: [
          { id: 'cs301-l1', title: '운영체제의 역할', durationSeconds: 2000, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs301-l2', title: '프로세스와 스레드', durationSeconds: 2800, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 메모리 관리',
        lectures: [
          { id: 'cs301-l3', title: '가상 메모리', durationSeconds: 3000, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs301-l4', title: '페이징과 세그멘테이션', durationSeconds: 2600, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 3,
        title: '3주차: 파일 시스템',
        lectures: [
          { id: 'cs301-l5', title: '파일 시스템 구조', durationSeconds: 2200, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  cs401: {
    courseId: 'cs401',
    title: '데이터베이스',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: DB 기초',
        lectures: [
          { id: 'cs401-l1', title: '관계형 데이터베이스 개요', durationSeconds: 1800, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs401-l2', title: 'SQL 기초 문법', durationSeconds: 2400, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 고급 SQL',
        lectures: [
          { id: 'cs401-l3', title: 'JOIN 연산', durationSeconds: 2700, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs401-l4', title: '인덱스와 최적화', durationSeconds: 2100, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  cs501: {
    courseId: 'cs501',
    title: '네트워크',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 네트워크 기초',
        lectures: [
          { id: 'cs501-l1', title: 'OSI 7계층 모델', durationSeconds: 2200, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs501-l2', title: 'TCP/IP 프로토콜', durationSeconds: 2500, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 응용 계층',
        lectures: [
          { id: 'cs501-l3', title: 'HTTP와 HTTPS', durationSeconds: 1900, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs501-l4', title: 'DNS와 도메인', durationSeconds: 1700, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  cs601: {
    courseId: 'cs601',
    title: '소프트웨어공학',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: SW 개발 방법론',
        lectures: [
          { id: 'cs601-l1', title: '애자일 방법론', durationSeconds: 2000, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs601-l2', title: '스크럼과 칸반', durationSeconds: 1800, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs601-l3', title: '요구사항 분석', durationSeconds: 2300, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 설계 패턴',
        lectures: [
          { id: 'cs601-l4', title: 'UML 다이어그램', durationSeconds: 2600, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs601-l5', title: '디자인 패턴 기초', durationSeconds: 2900, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  // ─── 간호학과 강의 목차 ───────────────────────────────────
  nu101: {
    courseId: 'nu101',
    title: '기초간호학',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 간호의 이해',
        lectures: [
          { id: 'nu101-l1', title: '간호학의 역사와 발전', durationSeconds: 1800, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu101-l2', title: '간호 철학과 윤리', durationSeconds: 2100, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 간호 과정',
        lectures: [
          { id: 'nu101-l3', title: '간호 사정과 진단', durationSeconds: 2400, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu101-l4', title: '간호 계획과 수행', durationSeconds: 2200, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu101-l5', title: '간호 평가', durationSeconds: 1600, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 3,
        title: '3주차: 활력징후',
        lectures: [
          { id: 'nu101-l6', title: '체온·맥박·호흡 측정', durationSeconds: 2500, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu101-l7', title: '혈압 측정과 해석', durationSeconds: 2000, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  nu102: {
    courseId: 'nu102',
    title: '해부생리학',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 인체의 구조',
        lectures: [
          { id: 'nu102-l1', title: '세포와 조직', durationSeconds: 2200, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu102-l2', title: '골격계와 근육계', durationSeconds: 2600, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 심혈관계',
        lectures: [
          { id: 'nu102-l3', title: '심장의 구조와 기능', durationSeconds: 2800, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu102-l4', title: '혈액 순환 경로', durationSeconds: 2400, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 3,
        title: '3주차: 호흡기계',
        lectures: [
          { id: 'nu102-l5', title: '폐와 기도의 구조', durationSeconds: 2100, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu102-l6', title: '가스 교환 메커니즘', durationSeconds: 1900, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  nu201: {
    courseId: 'nu201',
    title: '성인간호학I',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 내분비계 질환',
        lectures: [
          { id: 'nu201-l1', title: '당뇨병의 병태생리', durationSeconds: 2500, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu201-l2', title: '당뇨병 간호 중재', durationSeconds: 2800, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 심혈관계 질환',
        lectures: [
          { id: 'nu201-l3', title: '고혈압 간호', durationSeconds: 2300, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu201-l4', title: '심부전 간호', durationSeconds: 2600, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  nu202: {
    courseId: 'nu202',
    title: '기본간호실습',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 무균술',
        lectures: [
          { id: 'nu202-l1', title: '손 위생 6단계', durationSeconds: 1200, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu202-l2', title: '멸균 장갑 착용법', durationSeconds: 1500, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 투약 간호',
        lectures: [
          { id: 'nu202-l3', title: '경구 투약 방법', durationSeconds: 1800, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu202-l4', title: '근육주사·정맥주사', durationSeconds: 2200, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  nu301: {
    courseId: 'nu301',
    title: '아동간호학',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 성장발달',
        lectures: [
          { id: 'nu301-l1', title: '영아기 성장발달', durationSeconds: 2000, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu301-l2', title: '유아기·학령기 발달', durationSeconds: 2200, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 아동 질환 간호',
        lectures: [
          { id: 'nu301-l3', title: '호흡기 질환 아동 간호', durationSeconds: 2400, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu301-l4', title: '소화기 질환 아동 간호', durationSeconds: 2100, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  nu302: {
    courseId: 'nu302',
    title: '정신간호학',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 정신건강의 이해',
        lectures: [
          { id: 'nu302-l1', title: '정신건강과 정신질환', durationSeconds: 2100, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu302-l2', title: '치료적 의사소통', durationSeconds: 2400, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  nu401: {
    courseId: 'nu401',
    title: '지역사회간호학',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 지역사회 간호의 이해',
        lectures: [
          { id: 'nu401-l1', title: '지역사회 간호 개념', durationSeconds: 1900, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu401-l2', title: '지역사회 사정 방법', durationSeconds: 2300, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  nu402: {
    courseId: 'nu402',
    title: '간호관리학',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 간호 관리의 이해',
        lectures: [
          { id: 'nu402-l1', title: '간호 관리 이론', durationSeconds: 2000, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'nu402-l2', title: '간호 인력 관리', durationSeconds: 2200, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  // 추가 컴공과 강의
  cs102: {
    courseId: 'cs102',
    title: '프로그래밍기초',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 프로그래밍 입문',
        lectures: [
          { id: 'cs102-l1', title: '변수와 자료형', durationSeconds: 1800, isCompleted: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs102-l2', title: '조건문과 반복문', durationSeconds: 2100, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: 함수와 배열',
        lectures: [
          { id: 'cs102-l3', title: '함수 정의와 호출', durationSeconds: 2000, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs102-l4', title: '배열과 문자열', durationSeconds: 1900, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  cs202: {
    courseId: 'cs202',
    title: '객체지향프로그래밍',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: OOP 기초',
        lectures: [
          { id: 'cs202-l1', title: '클래스와 객체', durationSeconds: 2200, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs202-l2', title: '상속과 다형성', durationSeconds: 2500, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  cs302: {
    courseId: 'cs302',
    title: '컴퓨터구조',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: 컴퓨터 구조 개요',
        lectures: [
          { id: 'cs302-l1', title: 'CPU 구조와 동작', durationSeconds: 2400, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs302-l2', title: '메모리 계층 구조', durationSeconds: 2200, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
  cs402: {
    courseId: 'cs402',
    title: '웹프로그래밍',
    weeks: [
      {
        weekNumber: 1,
        title: '1주차: HTML/CSS',
        lectures: [
          { id: 'cs402-l1', title: 'HTML 기본 구조', durationSeconds: 1800, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs402-l2', title: 'CSS 레이아웃', durationSeconds: 2100, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
      {
        weekNumber: 2,
        title: '2주차: JavaScript',
        lectures: [
          { id: 'cs402-l3', title: 'JS 기초 문법', durationSeconds: 2300, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'cs402-l4', title: 'DOM 조작', durationSeconds: 2000, isCompleted: false, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        ],
      },
    ],
  },
}

// 강의별 채팅 메시지 (courseId별로 구분)
export const mockChatMessagesByCourse: Record<string, Array<{ id: string; authorName: string; content: string; createdAt: string }>> = {
  cs101: [
    { id: 'cs101-m1', authorName: '이현규', content: '교수님, 연결 리스트 삭제 연산에서 포인터 처리가 헷갈립니다.', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'cs101-m2', authorName: '김교수', content: '다음 강의에서 자세히 설명하겠습니다.', createdAt: new Date(Date.now() - 1800000).toISOString() },
  ],
  cs201: [
    { id: 'cs201-m1', authorName: '이현규', content: '퀵 정렬의 최악 시간 복잡도가 O(n²)인 경우가 언제인가요?', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'cs201-m2', authorName: '박교수', content: '피벗이 항상 최솟값이나 최댓값으로 선택될 때입니다.', createdAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  cs301: [
    { id: 'cs301-m1', authorName: '이현규', content: '가상 메모리와 물리 메모리의 차이가 뭔가요?', createdAt: new Date(Date.now() - 5400000).toISOString() },
  ],
  cs401: [],
  cs501: [],
  cs601: [
    { id: 'cs601-m1', authorName: '강교수', content: '이번 주 과제 마감은 금요일 23:59입니다.', createdAt: new Date(Date.now() - 86400000).toISOString() },
  ],
}

// 하위 호환성을 위한 기존 export (cs101 기준)
export const mockCourseOutline = mockCourseOutlines['cs101']
export const mockChatMessages = mockChatMessagesByCourse['cs101']
