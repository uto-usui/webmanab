// 記事の見出し画像。clip は旧サイトのスクショを使い、スクショのない clip と tip / lab は SVG のアイキャッチにする
import {
  EYECATCH_HEIGHT,
  EYECATCH_WIDTH,
  eyecatchFor,
  type EyecatchInput,
} from './eyecatch/index.ts'
import type { PostData } from './schema'

type Input = EyecatchInput & Pick<PostData, 'image'>

/** 一覧のサムネイル */
export const thumbnailFor = (data: Input): string =>
  data.image?.thumb ?? eyecatchFor(data).svg

/** 前後記事ナビの背景。スクショはそのまま使う（旧サイトと同じ） */
export const navImageFor = (data: Input): string =>
  data.image?.thumb ?? eyecatchFor(data).nav

/** 記事ページの画像 */
export const entryImageFor = (
  data: Input,
): { src: string; width: number; height: number } =>
  data.image ?? {
    src: eyecatchFor(data).svg,
    width: EYECATCH_WIDTH,
    height: EYECATCH_HEIGHT,
  }
