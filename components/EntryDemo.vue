<template>
  <div v-if="article.fields && article.fields.length !== 0 && article.fields['demo-true']">
    <a class="entry_demo" :href="article.fields['demo-url']" target="_blank">
      demo
    </a>
  </div>
</template>

<script>
export default {
  name: 'EntryDemo',
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  }
}
</script>

<style lang="scss">
.entry_demo {
  position: relative;
  z-index: 1;
  display: inline-block;
  margin-bottom: 3rem;
  font-size: 5rem;
  font-weight: bold;
  color: $black;
  text-transform: uppercase;
  transition: 0.45s $easeOutQuart;
  //
  @include desktop {
    margin-bottom: -2rem;
  }
  //
  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: -1;
    width: 60px;
    height: 60px;
    content: '';
    background: transparent;
    background-image: radial-gradient($black 20%, transparent 0),
      radial-gradient($black 20%, transparent 0);
    background-position: 0 0, 5px 5px;
    background-size: 10px 10px;
    transition: 0.45s $easeOutQuart;
    transform: translate(-50%, -50%) rotate(45deg);
    clip-path: polygon(
      0 0,
      59% 0,
      100% 0,
      100% 50%,
      100% 99%,
      60% 100%,
      0 100%
    );
  }

  //
  &:hover {
    color: $primary-color;
    text-decoration: none;
    //
    &::after {
      width: 200px;
      height: 200px;
      background: transparent;
      background-image: radial-gradient(rgba($black, 0.8) 20%, transparent 0),
        radial-gradient(rgba($black, 0.8) 20%, transparent 0);
      background-position: 0 0, 8px 8px;
      background-size: 16px 16px;
      border-radius: 50%;
      transform: translate(-50%, -50%) rotate(0);
      clip-path: polygon(
        0% 20%,
        60% 20%,
        60% 0%,
        100% 50%,
        60% 100%,
        60% 80%,
        0% 80%
      );
      clip-path: polygon(
        0 30%,
        50% 30%,
        50% 0,
        100% 50%,
        50% 100%,
        50% 70%,
        0 70%
      );
    }
  }
}
</style>
