/**
 * 과제 DB — 수강 중인 강의 기반으로 동적 생성
 * 과제 ID 형식: {courseId}-hw{n}  (예: cs101-hw1, nu101-hw1)
 */

export interface AssignmentRecord {
  id: string
  courseId: string
  title: string
  courseName: string
  dueDate: string
  description: string
}

// 강의별 과제 정의 (courseId → 과제 목록)
// 수강신청한 강의에 해당하는 과제만 학생에게 노출됩니다.
export const COURSE_ASSIGNMENTS: Record<string, Omit<AssignmentRecord, 'courseId'>[]> = {
  // 컴퓨터소프트웨어공학과
  cs101: [
    { id: 'cs101-hw1', title: '자료구조 과제 1 — 연결 리스트 구현', courseName: '자료구조', dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), description: '단순 연결 리스트를 구현하고, 삽입/삭제/탐색 연산을 작성하세요.' },
    { id: 'cs101-hw2', title: '자료구조 과제 2 — 스택/큐 구현',    courseName: '자료구조', dueDate: new Date(Date.now() + 5  * 24 * 60 * 60 * 1000).toISOString(), description: '배열 기반 스택과 큐를 구현하고 테스트 케이스를 작성하세요.' },
  ],
  cs102: [
    { id: 'cs102-hw1', title: '프로그래밍기초 과제 1 — 변수와 조건문', courseName: '프로그래밍기초', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: '변수 선언, 조건문, 반복문을 활용한 프로그램을 작성하세요.' },
  ],
  cs201: [
    { id: 'cs201-hw1', title: '알고리즘 과제 1 — 정렬 알고리즘 분석', courseName: '알고리즘', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), description: '버블 정렬, 퀵 정렬, 병합 정렬의 시간 복잡도를 분석하고 구현하세요.' },
    { id: 'cs201-hw2', title: '알고리즘 과제 2 — 동적 프로그래밍',   courseName: '알고리즘', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: '피보나치 수열과 배낭 문제를 동적 프로그래밍으로 풀어보세요.' },
  ],
  cs202: [
    { id: 'cs202-hw1', title: '객체지향 과제 1 — 클래스 설계', courseName: '객체지향프로그래밍', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), description: '상속과 다형성을 활용한 클래스 계층 구조를 설계하고 구현하세요.' },
  ],
  cs301: [
    { id: 'cs301-hw1', title: '운영체제 과제 1 — 프로세스 스케줄링', courseName: '운영체제', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), description: 'FCFS, SJF, Round Robin 스케줄링 알고리즘을 시뮬레이션하세요.' },
  ],
  cs302: [
    { id: 'cs302-hw1', title: '컴퓨터구조 과제 1 — 명령어 집합 분석', courseName: '컴퓨터구조', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), description: 'RISC와 CISC 명령어 집합 구조의 차이를 분석하고 보고서를 작성하세요.' },
  ],
  cs401: [
    { id: 'cs401-hw1', title: '데이터베이스 과제 1 — SQL 쿼리 작성', courseName: '데이터베이스', dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: 'SELECT, JOIN, GROUP BY를 활용한 복합 쿼리를 작성하세요.' },
    { id: 'cs401-hw2', title: '데이터베이스 과제 2 — ERD 설계',      courseName: '데이터베이스', dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), description: '쇼핑몰 시스템의 ERD를 설계하고 정규화 과정을 서술하세요.' },
  ],
  cs402: [
    { id: 'cs402-hw1', title: '웹프로그래밍 과제 1 — HTML/CSS 레이아웃', courseName: '웹프로그래밍', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Flexbox와 Grid를 활용하여 반응형 웹 페이지를 제작하세요.' },
  ],
  cs501: [
    { id: 'cs501-hw1', title: '네트워크 과제 1 — OSI 계층 분석', courseName: '네트워크', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: 'Wireshark로 패킷을 캡처하고 OSI 7계층별로 분석하세요.' },
  ],
  cs601: [
    { id: 'cs601-hw1', title: '소프트웨어공학 과제 1 — 요구사항 명세서', courseName: '소프트웨어공학', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), description: '팀 프로젝트 주제를 선정하고 SRS 문서를 작성하세요.' },
  ],
  // 간호학과
  nu101: [
    { id: 'nu101-hw1', title: '기초간호학 과제 1 — 간호 과정 적용', courseName: '기초간호학', dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), description: '간호 사정, 진단, 계획, 수행, 평가의 5단계 간호 과정을 사례에 적용하세요.' },
    { id: 'nu101-hw2', title: '기초간호학 과제 2 — 활력징후 측정 보고서', courseName: '기초간호학', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), description: '활력징후(체온, 맥박, 호흡, 혈압) 측정 실습 결과를 보고서로 작성하세요.' },
  ],
  nu102: [
    { id: 'nu102-hw1', title: '해부생리학 과제 1 — 심혈관계 구조와 기능', courseName: '해부생리학', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), description: '심장의 구조와 혈액 순환 경로를 그림과 함께 설명하세요.' },
  ],
  nu201: [
    { id: 'nu201-hw1', title: '성인간호학 과제 1 — 당뇨병 간호 계획', courseName: '성인간호학I', dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), description: '제2형 당뇨병 환자의 간호 문제를 도출하고 간호 중재를 계획하세요.' },
    { id: 'nu201-hw2', title: '성인간호학 과제 2 — 고혈압 사례 연구',  courseName: '성인간호학I', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: '고혈압 환자 사례를 분석하고 약물 요법과 생활 습관 교육 계획을 작성하세요.' },
  ],
  nu202: [
    { id: 'nu202-hw1', title: '기본간호실습 과제 1 — 무균술 실습 보고서', courseName: '기본간호실습', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), description: '손 위생과 무균술 실습 과정을 단계별로 기록하고 반성문을 작성하세요.' },
  ],
  nu301: [
    { id: 'nu301-hw1', title: '아동간호학 과제 1 — 성장발달 단계 분석', courseName: '아동간호학', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), description: '에릭슨의 심리사회 발달 이론을 아동 간호에 적용하는 방법을 서술하세요.' },
  ],
  nu302: [
    { id: 'nu302-hw1', title: '정신간호학 과제 1 — 치료적 의사소통', courseName: '정신간호학', dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(), description: '치료적 의사소통 기법을 역할극으로 실습하고 성찰 일지를 작성하세요.' },
  ],
  nu401: [
    { id: 'nu401-hw1', title: '지역사회간호학 과제 1 — 지역사회 사정', courseName: '지역사회간호학', dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(), description: '특정 지역사회의 건강 문제를 사정하고 우선순위를 결정하세요.' },
  ],
  nu402: [
    { id: 'nu402-hw1', title: '간호관리학 과제 1 — 간호 단위 관리 분석', courseName: '간호관리학', dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), description: '병원 간호 단위의 인력 배치와 업무 분담 방식을 분석하고 개선안을 제시하세요.' },
  ],
}

// 전체 과제 목록 (핸들러에서 ID로 조회할 때 사용)
export const allAssignments: AssignmentRecord[] = Object.entries(COURSE_ASSIGNMENTS).flatMap(
  ([courseId, assignments]) => assignments.map((a) => ({ ...a, courseId }))
)
