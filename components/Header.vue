<template>
  <header class="header" :class="[{'is-fixed': isFixed}]">
    <div ref="target" class="header__inner" :class="[{'is-fixed': isFixed}]">
      <h1 class="header__title">
        <nuxt-link to="/">
          webmanab.html
        </nuxt-link>
      </h1>
      <nav class="header__nav">
        <ul class="header__nav-list">
          <li class="header__nav-item">
            <nuxt-link class="header__nav-target" to="/tip/">
              tip
            </nuxt-link>
          </li>
          <li class="header__nav-item">
            <nuxt-link class="header__nav-target" to="/clip/">
              clip
            </nuxt-link>
          </li>
          <li class="header__nav-item">
            <nuxt-link class="header__nav-target" to="/lab/">
              lab
            </nuxt-link>
          </li>
          <li class="header__nav-item">
            <nuxt-link class="header__nav-target" to="/">
              about
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style lang="scss">
.header {
  position: relative;
  //
  &.is-fixed {
    // padding-top: 120px;
  }
}

.header__inner {
  padding-top: space-scalar(4);
  padding-right: space-scalar(4);
  padding-left: space-scalar(4);
  //
  @include tablet {
    padding: space-scalar(8);
  }
  //
  @include desktop {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: space-scalar(14);
    padding-right: space-scalar(10);
    padding-left: space-scalar(10);
  }
  //
  &.is-fixed {
    position: fixed;
    height: 40px;
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
  }
}

.header__title {
  // padding-left: $space-2;
  margin-top: $space-6;
  margin-bottom: $space-2;
  //
  > a {
    display: inline-block;
    font-weight: 600;
    color: $glay;
    transition: transform 0.3s $easeInOutSine;
    transform-origin: left center;
    //
    @include sizes(4);

    .header.is-fixed & {
      transform: scale(0.85);
    }
  }
  //
  @include desktop {
    padding-left: space-scalar(6);
    margin-top: 0;
    margin-bottom: 0;
  }
}

.header__nav {
  // padding-left: $space-3;
  //
  @include desktop {
    padding-right: calc(#{space-scalar(10)} + #{space-scalar(16)});
  }
}

.header__nav-list {
  display: flex;
  justify-content: center;
  //
  @include desktop {
    justify-content: flex-end;
  }
}

.header__nav-item {
  //
  + .header__nav-item {
    margin-left: space-scalar(10);
    //
    @include desktop {
      margin-left: space-scalar(12);
    }
  }
}

.header__nav-target {
  font-style: italic;
  color: $glay;
  //
  @include sizes(1);
  //
  &:hover {
    text-decoration: none;
  }
}
</style>

<script>
export default {
  components: {},
  data() {
    return {
      isFixed: false
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.checkFixed()
    })
  },
  methods: {
    checkFixed() {
      this.isFixed = window.innerWidth >= 1080 && window.pageYOffset > 45

      requestAnimationFrame(this.checkFixed)
    }
  }
}
</script>
