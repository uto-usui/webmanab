// stories の形（07 の 6 章）。Storybook の CSF3 に近づけてあり、カタログ用の項目は parameters.catalog に入れる。
// e2e/catalog/ からも読むので、ここでは .astro を import しない
import type { ComponentProps } from 'astro/types'

export const WIDTHS = [375, 768, 1080, 1480] as const
export type Width = (typeof WIDTHS)[number]

export type Step =
  | { click: string }
  | { hover: string }
  /** キーボードの Tab で当てる。:focus-visible を出すため */
  | { focus: string }
  /** window をスクロールする量（px） */
  | { scroll: number }
  /** selector の要素が見えるまで待つ。fetch のあとの DOM の変化を待つため */
  | { waitFor: string }
  | { wait: number }

/** e2e/catalog/mocks.ts の名前 */
export type MockName =
  | 'share-supported'
  | 'share-unsupported'
  | 'share-abort'
  | 'hold-timers'
  | 'list-pending'
  | 'eyecatch-pending'

export interface CatalogParameters {
  /** スクリーンショットと axe の前にする操作 */
  steps?: Step[]
  mocks?: MockName[]
  /** 撮る幅を絞る。既定は 4 幅すべて */
  widths?: Width[]
  /** fixed の要素が主役の状態は、フルページではなく画面の範囲だけ撮る */
  viewportOnly?: boolean
  /** window をスクロールさせる story のために、包みの div に付ける最小の高さ（px） */
  minHeight?: number
  /** 包みの div の padding（px）。ホバーで部品の外にはみ出す飾りを画面に入れるため */
  padding?: number
  /** 部品が <html> から書くので、カタログの包み（Frame.astro）に入れない */
  page?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = (props: any) => any

/** slot は HTML の文字列で渡す。Story.astro が set:html で流し込む */
export type Args<C extends AnyComponent> = Partial<ComponentProps<C>> & {
  slot?: string
}

export interface Meta<C extends AnyComponent> {
  component: C
  args?: Args<C>
  parameters?: { catalog?: CatalogParameters }
}

export interface Story<C extends AnyComponent> {
  args?: Args<C>
  parameters?: { catalog?: CatalogParameters }
}

/** /catalog/index.json の 1 件。テストはこれを読む */
export interface StoryEntry extends Omit<CatalogParameters, 'widths'> {
  /** `<部品の kebab-case>/<story の kebab-case>` */
  id: string
  component: string
  name: string
  widths: Width[]
}
