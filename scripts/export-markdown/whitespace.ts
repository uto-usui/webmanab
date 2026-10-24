// HTML の空白は space・tab・LF・FF・CR だけ。JS の \s と trim() は U+3000 や U+202F、U+00A0 も
// 空白として扱い、旧サイトで表示されていた文字を変えてしまうので使わない
const WS = '[ \\t\\n\\f\\r]'

export const collapseWhitespace = (s: string) =>
  s.replace(new RegExp(`${WS}+`, 'g'), ' ')
export const removeWhitespace = (s: string) =>
  s.replace(new RegExp(`${WS}+`, 'g'), '')
export const trimWhitespace = (s: string) =>
  s.replace(new RegExp(`^${WS}+|${WS}+$`, 'g'), '')
export const isBlank = (s: string) => new RegExp(`^${WS}*$`).test(s)
