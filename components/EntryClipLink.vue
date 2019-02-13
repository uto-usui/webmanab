<template>
  <a v-if="article.fields" class="entry-clip__img" :href="article.fields['clip-url']" target="_blank">
    <LazyImage :src="img" :alt="alt" />
  </a>
</template>

<script>
import LazyImage from '~/components/LazyImage'

export default {
  name: 'EntryClipLink',
  components: {
    LazyImage
  },
  props: {
    article: {
      type: Object,
      default: () => {}
    },
    img: {
      type: String,
      default: ''
    },
    alt: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.entry-clip__img {
  position: relative;
  z-index: 1;
  display: block;
  overflow: hidden;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    $black 0,
    $black 5px
  );
  background-color: transparent;
  transition: 1s;
  clip-path: polygon(0 50%, 0 0, 99% 0, 100% 66%, 100% 100%, 50% 100%, 0 100%);
  //
  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 3;
    font-size: 5rem;
    font-weight: bold;
    color: $white;
    text-transform: uppercase;
    content: 'visit to';
    transition: 1s;
    transform: translate(-50%, -50%) scale(0.1);
  }
  //
  > img {
    position: relative;
    z-index: 2;
    vertical-align: bottom;
    transition: 1s;
    backface-visibility: hidden;
  }
  //
  &:hover {
    clip-path: polygon(
      0 0,
      100% 0%,
      100% 80%,
      75% 80%,
      75% 100%,
      50% 80%,
      0 80%
    );
    //
    &::after {
      transform: translate(-50%, -50%) scale(1);
    }
    //
    > img {
      opacity: 0.05;
    }
  }
}
</style>
