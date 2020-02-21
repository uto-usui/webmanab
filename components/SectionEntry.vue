<template>
  <article class="entry">
    <slot />
  </article>
</template>

<script>
export default {
  name: 'SectionList'
}
</script>

<style lang="scss" scoped>
.entry {
  max-width: calc(#{$space-11});
  padding-top: $space-5;
  margin-right: auto;
  margin-left: auto;
  //
  @include tablet {
    max-width: calc(#{$space-11} + 30px * 2);
    padding-right: 30px;
    padding-left: 30px;
    overflow: hidden;
  }
  //
  @include desktop {
    max-width: calc(#{$space-11} + 40px * 2);
    padding-right: 40px;
    padding-left: 40px;
  }
}
</style>
