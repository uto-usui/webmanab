// 記事ごとの揺らぎ用。Math.random は使わず、同じ種なら必ず同じ列を返す
export function hashString(s: string): number {
  // FNV-1a 32bit
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export type Rng = {
  next(): number
  range(min: number, max: number): number
  int(min: number, max: number): number
  pick<T>(list: readonly T[]): T
  chance(p: number): boolean
  shuffle<T>(list: readonly T[]): T[]
}

// mulberry32
export function createRng(seed: string): Rng {
  let a = hashString(seed)
  const next = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    range: (min, max) => min + (max - min) * next(),
    int: (min, max) => Math.floor(min + (max - min + 1) * next()),
    pick: (list) => list[Math.floor(next() * list.length)],
    chance: (p) => next() < p,
    shuffle: (list) => {
      const out = [...list]
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
      }
      return out
    },
  }
}
