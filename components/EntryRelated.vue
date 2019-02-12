<template>
  <section class="related u-text-left">
    <h3 class="related_title">
      related<br>ー
    </h3>
    <ul class="related_list">
      <li class="related_item">
        <a class="related_target" href="https://webmanab-html.com/tip/scroll-box-animation/">
          スクロールするレイヤー内でアンカーリンクを設置して指定位置までスクロールさせる
          -『jQuery』
        </a>
      </li>
      <li class="related_item">
        <a class="related_target" href="https://webmanab-html.com/tip/image-hover-effect/">
          これは素敵。ギャラリーなど画像のホバーエフェクトやクリックイベントに利用したいエフェクトサンプル集
          – 『effect』
        </a>
      </li>
      <li class="related_item">
        <a class="related_target" href="https://webmanab-html.com/tip/wait-animate/">
          CSSのkeyframesアニメーションで待機時間を指定したものを吐き出す
          WAIT! Animate – 『CSS』
        </a>
      </li>
    </ul>
  </section>
</template>
<script>
export default {
  name: 'EntryRelated',
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
<style lang="scss" scoped>
.related {
  margin-top: 2rem;
  text-align: justify;
  //
  @include tablet {
    padding: 1rem;
    margin-top: 5rem;
    border: 6px double currentColor;
  }
  //
  @include desktop {
    padding: 1.5rem 2rem;
  }
}

.related_title {
  padding-left: 0.2rem;
  font-size: 1.25rem;
  font-style: italic;
  color: $glay;
  letter-spacing: 0.1em;
  //
  @include tablet {
    padding-left: 0.4rem;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
}

.related_list {
  //
}

.related_item {
  line-height: 1.7;
  //
  + .related_item {
    margin-top: 1rem;
  }
}

.related_target {
  position: relative;
  top: 0;
  left: 0;
  padding: 0.2em 0.5em 0.15em;
  line-height: 2.5;
  color: $white;
  background-color: $glay;
  transition: 0.25s $easeOutQuart;
  //
  &:hover {
    top: -5px;
    left: 5px;
    text-decoration: none;
    box-shadow: -5px 5px 0 $primary-color;
  }
}
</style>
