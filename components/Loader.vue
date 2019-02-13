<template>
  <div class="loader">
    <span v-for="index in 20" :key="`loader${index}`" />
  </div>
</template>

<script>
export default {
  name: 'Loader'
}
</script>

<style lang="scss" scoped>
.loader {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 9999;
  transform: translate(-50%, -50%);
  //
  > span {
    display: inline-block;
    width: 7.5px;
    height: 7.5px;
    margin: 0 2px;
    background: lighten($thirdry-color, 8%);
    border-radius: 0;
    animation: temp 1s infinite cubic-bezier(0.005, 0.56, 0.58, 1.59);
    //
    @for $i from 1 through 20 {
      $delay: $i * 0.05 + s;
      //
      &:nth-of-type(#{$i}) {
        animation-delay: $delay;
      }
    }
  }
}

@keyframes temp {
  50% {
    background: darken($thirdry-color, 2%);
    transform: scale(1, 5);
  }
}
</style>
