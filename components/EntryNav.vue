<template>
  <ul class="entry-nav">
    <li class="entry-nav_item u-text-left">
      <a href="" class="entry-nav_target">
        <div class="entry-nav_inner">
          <p class="entry-nav_text">
            previous
            <br>ー
          </p>
          <h3 class="entry-nav_title">
            スクロールするレイヤー内でアンカーリンクを設置して指定位置までスクロールさせる -『jQuery』
          </h3>
        </div>
      </a>
      <div class="entry-nav_bg" style="background-image: url(https://c1.staticflickr.com/9/8828/28742105241_acfc8eb707_o.jpg);" />
    </li>
    <li class="entry-nav_item u-text-right">
      <a href="" class="entry-nav_target">
        <div class="entry-nav_inner">
          <p class="entry-nav_text">
            next
            <br>ー
          </p>
          <h3 class="entry-nav_title">
            までスクロールさせる -『jQuery』
          </h3>
        </div>
      </a>
      <div class="entry-nav_bg" style="background-image: url(https://c1.staticflickr.com/8/7472/28889980152_3fdd67bb51_o.jpg);" />
    </li>
  </ul>
</template>
<script>
export default {
  name: 'EntryNav',
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
<style lang="scss" scoped>
.entry-nav {
  margin-top: 2rem;
  //
  @include tablet {
    display: flex;
    margin-top: 5rem;
  }
}

.entry-nav_item {
  position: relative;
  z-index: 5;
  overflow: hidden;
  perspective: 800px;
  transform-style: preserve-3d;
  //
  @include mobile {
    //
    + .entry-nav_item {
      margin-top: 1rem;
    }
  }
  //
  @include tablet {
    width: 50%;
  }
}

.entry-nav_target {
  display: flex;
  align-items: center;
  height: 120px;
  //
  @include tablet {
    height: 180px;
  }
  //
  &:hover {
    text-decoration: none;
  }

  //
  .entry-nav_item:last-child & {
    justify-content: flex-end;
  }
}

.entry-nav_inner {
  //
}

.entry-nav_text {
  font-size: 1.8rem;
  font-style: italic;
  color: $white;
  text-transform: capitalize;
  transition: 0.3s $easeOutQuint;
  //
  @include tablet {
    font-size: 2.2rem;
  }
  //
  .entry-nav_item:hover & {
    color: $glay;
    letter-spacing: 0.2em;
  }
}

.entry-nav_title {
  display: inline;
  line-height: 1.7;
  color: $black;
  background-color: $white;
  //
  @include tablet {
    line-height: 2;
  }
}

.entry-nav_bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  transition: 0.35s $easeOutQuint;
  //
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -2;
    content: '';
    background-color: rgba($glay, 0.7);
  }

  //
  .entry-nav_item:first-of-type & {
    transform-origin: right center;
  }

  .entry-nav_item:last-of-type & {
    transform-origin: left center;
  }

  .entry-nav_item:first-of-type:hover & {
    transform: rotateY(-45deg);
  }

  .entry-nav_item:last-of-type:hover & {
    transform: rotateY(45deg);
  }
}
</style>
