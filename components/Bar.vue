<template>
  <div class="bar" />
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.bar {
  position: fixed;
  z-index: 99;
  margin: space-scalar(4);
  pointer-events: none;
  background-color: $glay;
  //
  @include tablet {
    margin: space-scalar(8);
  }
  //
  @include desktop {
    margin: space-scalar(10);
  }

  &:nth-of-type(1) {
    top: 0;
    right: 0;
    left: 0;
    height: 2px;
  }

  &:nth-of-type(2) {
    right: 0;
    bottom: 0;
    left: 0;
    height: 2px;
  }

  &:nth-of-type(3) {
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
  }

  &:nth-of-type(4) {
    top: 0;
    right: 0;
    bottom: 0;
    width: 2px;
  }
}
</style>
