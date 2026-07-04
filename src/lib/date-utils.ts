// 서버(Node)와 브라우저 모두 실행 환경의 로컬 타임존과 무관하게
// 한국 시간(KST, UTC+9) 기준 오늘 날짜(YYYY-MM-DD)를 반환한다.
//
// new Date().toISOString().slice(0, 10) 는 UTC 기준이라
// 한국시간 새벽 0~8시대에는 실제보다 하루 이른 날짜가 나오는 문제가 있었음.
export function getKstDateString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(date)
}
