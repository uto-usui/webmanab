<template>
  <main class="wrapper">
    <slot />
  </main>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.wrapper {
  padding-right: 15px;
  padding-left: 15px;
  margin-top: 65px;
  margin-bottom: 120px;
  //
  @include tablet {
    padding-right: 30px;
    padding-left: 30px;
  }
  //
  @include desktop {
    padding-top: calc(#{$space-7} + #{$space-6});
    padding-right: 40px;
    // padding-bottom: calc(#{$space-8} + #{$space-6});
    padding-left: 40px;
    margin-top: 0;
    margin-bottom: 200px;
  }
  //
  &.article--line {
    position: relative;
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
}
</style>
