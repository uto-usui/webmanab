<template>
  <h2 class="h1">
    <span class="h1__inner">
      <nuxt-link :to="`/${text}`" v-text="text" />
    </span>
  </h2>
</template>

<script>
export default {
  name: 'Title1',
  props: {
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.h1 {
  font-size: $font-size-l7;
  font-style: italic;
  font-weight: bold;
  text-transform: capitalize;
}

.h1__inner {
  position: relative;
  padding-bottom: 10px;
  //
  &::after {
    position: absolute;
    top: 0;
    left: -40px;
    width: 50px;
    height: 50px;
    content: '';
    border-top: 2px solid currentColor;
    border-left: 2px solid currentColor;
    transition: 0.45s $easeTitle;
  }
  //
  &::before {
    position: absolute;
    right: -40px;
    bottom: 0;
    width: 50px;
    height: 50px;
    content: '';
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transition: 0.45s $easeTitle;
  }
  //
  &:hover {
    //
    &::after {
      left: 0;
      width: 100%;
      height: 2px;
    }
    //
    &::before {
      right: 0;
      width: 100%;
      height: 2px;
    }
  }
  //
  > a {
    position: relative;
    display: inline-block;
    font-weight: bold;
    color: $black;
    perspective: 400px;
    backface-visibility: hidden;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    transition: text-shadow 0.4s, letter-spacing 0.4s;
    //
    &::after {
      position: absolute;
      top: -2.8em;
      left: 50%;
      width: 6em;
      font-size: $font-size-l2;
      font-style: italic;
      content: 'All View';
      opacity: 0;
      transition: 0.45s $easeInQuart;
      transform: translateX(-50%) rotateX(180deg) scale(0.6);
    }
    //
    &:hover {
      text-decoration: none;
      text-shadow: 150px 3px 0 $thirdry-color, -150px 3px 0 $secondary-color;
      letter-spacing: -0.05em;
      //
      &::after {
        letter-spacing: 0.05em;
        opacity: 1;
        transform: translateX(-50%) rotateX(0) scale(1);
      }
    }
  }
}
</style>
