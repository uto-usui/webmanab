// ビルド環境のタイムゾーン（Netlify は UTC の想定）に左右されないよう、記事を書いた日本時間に固定する
const TIME_ZONE = 'Asia/Tokyo'
const OFFSET = '+09:00'

const parts = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const jst = (date: Date) => {
  const p = Object.fromEntries(
    parts.formatToParts(date).map(({ type, value }) => [type, value]),
  )
  return {
    ymd: `${p.year}-${p.month}-${p.day}`,
    hms: `${p.hour}:${p.minute}:${p.second}`,
  }
}

/** 一覧と記事に出す日付。旧サイトの `YYYY-MM-DD` と同じ形 */
export const formatDate = (date: Date) => jst(date).ymd

/** `<time datetime>` や構造化データ用。`2020-03-22T00:26:34+09:00` の形 */
export const toIsoJst = (date: Date) => {
  const { ymd, hms } = jst(date)
  return `${ymd}T${hms}${OFFSET}`
}
