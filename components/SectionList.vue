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
  margin-bottom: get-line-height(7, 0, 1);
  //
  @include desktop {
    margin-bottom: get-line-height(7, 0, 2);
  }
  //
  &::after {
    position: absolute;
    bottom: calc(#{get-line-height(7, 0, 1)} / 2 * -1 + #{space-scalar(4)} / 2);
    left: 50%;
    width: 30%;
    max-width: space-scalar(75);
    height: space-scalar(4);
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
      bottom: calc(
        #{get-line-height(7, 0, 2)} / 2 * -1 + #{space-scalar(4)} / 2
      );
    }
  }
}
</style>
