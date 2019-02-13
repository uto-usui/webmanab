<template>
  <section class="section-list">
    <slot />
  </section>
</template>

<script>
export default {
  name: 'SectionList'
}
</script>

<style lang="scss" scoped>
.section-list {
  position: relative;
  z-index: 1;
  margin-top: 65px;
  margin-bottom: 120px;
  //
  @include desktop {
    margin-bottom: 200px;
  }
  //
  &::after {
    position: absolute;
    bottom: -60px;
    left: 50%;
    width: 30%;
    max-width: 300px;
    height: 15px;
    content: '';
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 4px,
      $black 0,
      $black 5px
    );
    background-color: transparent;
    transform: translate(-50%, -50%);
    //
    @include desktop {
      bottom: -100px;
    }
  }
}
</style>
