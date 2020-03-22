<template>
  <h3 class="title2">
    <slot />
  </h3>
</template>
<script>
export default {
  name: 'Title2'
}
</script>
<style lang="scss" scoped>
.title2 {
  padding-left: 0.2rem;
  font-style: italic;
  color: $glay;
  text-align: left;
  letter-spacing: 0.1em;
  //
  @include sizes(-1);
  //
  @include tablet {
    padding-left: 0.4rem;
    margin-bottom: 1rem;
    //
    @include sizes(2);
  }
}
</style>
