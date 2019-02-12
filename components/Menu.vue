<template>
  <div class="menu__wrapper">
    <nav class="menu" :class="[{'is-open': isOpen}]">
      <a class="menu__btn" href="#" @click.prevent="isOpen = !isOpen">
        menu
      </a>
      <div class="menu__inner">
        <MenuList :list-data="tipsList" list-title="tip" />
        <MenuList :list-data="clipsList" list-title="clip" />
      </div>
    </nav>
    <div class="menu__overlay" />
  </div>
</template>

<style lang="scss">
.menu__wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  perspective: 800px;
  pointer-events: none;
}

.menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  margin: 15px;
  transition: transform 0.85s $easeInOutQuint;
  transform: translateX(100%);
  perspective: 800px;
  will-change: transform;
  //
  &.is-open {
    transform: translateX(0);
  }

  //
  @include tablet {
    margin: 30px;
  }
  //
  @include desktop {
    margin: 40px;
  }
}

.menu__btn {
  position: relative;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  font-style: italic;
  font-weight: bold;
  color: $secondary-color;
  text-transform: uppercase;
  pointer-events: auto;
  background-color: $glay;
  transition: transform 0.45s $easeOutSine;
  transition-delay: 0.35s;
  transform: translateX(-60px);
  will-change: transform;
  //
  &:hover {
    text-decoration: none;
  }

  // active
  .menu.is-open & {
    transition-delay: 0s;
    transform: translateX(0);
  }
}

.menu__inner {
  width: calc(100% - 60px);
  height: 100%;
  padding-top: 20px;
  overflow-y: auto;
  background-color: rgba($glay, 0.95);
  transition: 0.85s $easeInOutExpo;
  transform: rotateY(5deg);
  transform-origin: 0% 50%;
  //
  .menu.is-open & {
    pointer-events: auto;
    opacity: 1;
    transform: rotateY(0);
  }
}

.menu__overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  margin: 15px;
  background-color: rgba($thirdry-color, 0);
  transition: 0.4s $easeInOutExpo;
  transform: rotateY(10deg) translateX(-100%) translateZ(0);
  transform-origin: 0% 50%;
  //
  @include tablet {
    margin: 30px;
  }
  //
  @include desktop {
    margin: 40px;
  }
  // active
  @at-root {
    .menu.is-open + .menu__overlay {
      background-color: rgba($thirdry-color, 0.85);
      transform: rotateY(0) translateX(0) translateZ(0);
    }
  }
}
</style>

<script>
import MenuList from './MenuList'

export default {
  components: { MenuList },
  data() {
    return {
      tipsList: [],
      clipsList: [],
      isOpen: false
    }
  },
  async created() {
    const query1 = {
      per_page: 100,
      page: 1
    }
    const query2 = {
      per_page: 100,
      page: 2
    }
    // get taxnomy for menu
    const data = await Promise.all([
      this.$api.get('/tips', query1),
      this.$api.get('/tips', query2),
      this.$api.get('/clips', query1),
      this.$api.get('/clips', query2)
    ])
    const tips1 = data[0].data
    const tips2 = data[1].data
    const clips1 = data[2].data
    const clips2 = data[3].data
    this.tipsList = [...tips1, ...tips2]
    this.clipsList = [...clips1, ...clips2]

    // console.log(this.clipsList)
  }
}
</script>
