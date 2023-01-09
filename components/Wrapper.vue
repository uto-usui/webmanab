<template>
  <main class="wrapper">
    <div class="wrapper__inner">
      <slot />
    </div>
  </main>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.wrapper {
  padding-right: space-scalar(4);
  padding-left: space-scalar(4);
  margin-top: space-scalar(16);
  margin-bottom: space-scalar(30);
  overflow-x: hidden;
  //
  @include tablet {
    padding-right: space-scalar(8);
    padding-left: space-scalar(8);
  }
  //
  @include desktop {
    padding-top: space-scalar(10);
    padding-right: space-scalar(10);
    padding-left: space-scalar(10);
    margin-top: 0;
    margin-bottom: space-scalar(50);
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

.wrapper__inner {
  @include desktop {
    padding-top: calc(#{space-scalar(10)} + #{get-line-height(7, 0, 1)});
  }
}
</style>
