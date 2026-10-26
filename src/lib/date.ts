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

/** これより前の modified は WordPress の一括の編集で付いた日付が多く、書き直した日とは限らないので出さない（#48） */
export const SHOWN_MODIFIED_FROM = '2026-10-25'

/** 記事に出す更新日。SHOWN_MODIFIED_FROM 以降で、日本時間の日付が公開日と違うときだけ返す */
export const shownModified = ({
  date,
  modified,
}: {
  date: Date
  modified?: Date
}) => {
  if (!modified) return undefined
  const day = formatDate(modified)
  return day >= SHOWN_MODIFIED_FROM && day !== formatDate(date)
    ? modified
    : undefined
}
