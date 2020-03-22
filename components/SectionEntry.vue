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
  max-width: calc(#{space-scalar(232)});
  padding-top: space-scalar(10);
  padding-bottom: space-scalar(10);
  margin-right: auto;
  margin-left: auto;
  //
  @include tablet {
    max-width: calc(#{space-scalar(232)} + #{space-scalar(8)} * 2);
    padding-right: space-scalar(8);
    padding-left: space-scalar(8);
    // overflow: hidden;
  }
  //
  @include desktop {
    max-width: calc(#{space-scalar(232)} + #{space-scalar(10)} * 2);
    padding-right: space-scalar(10);
    padding-left: space-scalar(10);
  }
}
</style>
