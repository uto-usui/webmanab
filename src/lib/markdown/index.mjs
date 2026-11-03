// astro.config.mjs とテストで同じ設定を使うため、ここにまとめる
import { externalLinksPlugin } from './external-links.mjs'
import { headingIdsPlugin } from './heading-ids.mjs'
import { hljsPlugin } from './hljs.mjs'
import { iframeTitlePlugin } from './iframe-title.mjs'
import { imageSizePlugin } from './image-size.mjs'
import { labobalDemoLinksPlugin } from './labobal-demo-links.mjs'

export const markdownFeatures = {
  // 生 HTML（dl、iframe を包んだ p など）を要素として解析し直し、下のプラグインから見えるようにする
  rawHtml: true,
  // 旧本文の引用符・-- ・... を変えない
  smartPunctuation: false,
}

export const hastPlugins = [
  hljsPlugin,
  headingIdsPlugin,
  // 足したリンクにも外部リンクの属性が付くよう、externalLinksPlugin より前に置く
  labobalDemoLinksPlugin,
  externalLinksPlugin,
  iframeTitlePlugin,
  imageSizePlugin,
]
