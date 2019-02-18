<template>
  <div class="entry-toc__wrap" v-if="list.length !== 0">
    <section
      class="entry-toc"
      :class="[{'is-open': isOpen}]"
    >
      <a
        href="#"
        class="entry-toc__title"
        @click.prevent="isOpen = !isOpen"
      >
        table of contents<br>ー
      </a>
      <ul class="entry-toc__list">
        <li v-for="(item, index) in list" :key="`toc${index}`" class="entry-toc__item">
          <a
            v-scroll-to="`#a${index}`"
            href="#"
            class="entry-toc__target"
            v-text="item.h2"
          />
          <ul v-if="item.h3">
            <li v-for="(_item, _index) in item.h3" :key="`toc${_index}`" class="toc-item__child">
              <a
                v-scroll-to="`#a${index}${_index}`"
                href="#"
                v-text="`_${_item}`"
              />
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.entry-toc__wrap {
  max-width: calc(1em * 42);
  margin-right: auto;
  margin-left: auto;
  font-size: 1.5rem;
  //
  @include tablet {
    padding-right: 1em;
    padding-left: 1em;
    margin-top: 5rem;
    margin-bottom: 5rem;
    font-size: 1.6rem;
  }
}

.entry-toc {
  position: relative;
  display: block;
  max-height: 120px;
  padding-top: 1rem;
  padding-right: 1em;
  padding-bottom: 2rem;
  padding-left: 1em;
  overflow: hidden;
  border-top: 6px double currentColor;
  border-bottom: 6px solid currentColor;
  transition: 0.4s $easeInOutSine;
  //
  @include tablet {
    max-height: 140px;
    font-size: 1.6rem;
  }
  //
  &.is-open {
    max-height: 999px;
    padding-bottom: 4.5rem;
    //
    @include tablet {
      padding-right: 1.5rem;
      padding-left: 1.5rem;
    }
  }
  //
  &:hover {
    //
  }
}

.entry-toc__title {
  display: block;
  margin-bottom: 1rem;
  font-size: 2rem;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  cursor: pointer;
  //
  @include desktop {
    font-size: 2.4rem;
    line-height: 1.5;
  }
  //
  &::after {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    z-index: 9;
    font-size: 1.8rem;
    font-style: italic;
    content: 'open';
    transition: 0.2s $easeInOutQuart;
    transform: translateX(-50%);
    //
    .entry-toc_title:hover & {
      letter-spacing: 0.6em;
    }
    //
    .entry-toc.is-open & {
      content: 'close';
    }
  }
}

.entry-toc__list {
  position: relative;
  z-index: 1;
  padding-left: 3rem;
  line-height: 1.35;
  text-align: left;
  opacity: 0;
  transition: 0.4s $easeInOutSine;
  //
  @include tablet {
    padding-top: 0.5rem;
    padding-bottom: 1rem;
    font-size: 1.6rem;
    line-height: 1;
  }
  //
  .entry-toc.is-open & {
    opacity: 1;
    transition-delay: 0.2s;
  }
}

.entry-toc__item {
  font-size: 1.4rem;
  letter-spacing: 0.1em;
  list-style-type: decimal;
  //
  + .entry-toc__item {
    margin-top: 1.5rem;
  }
  //
  @include tablet {
    font-size: 1.6rem;
    //
    + .entry-toc__item {
      margin-top: 3rem;
    }
  }
  //
  .entry-toc.is-open & {
    opacity: 1;
  }
}

.toc-item__child {
  margin-top: 1rem;
  font-size: 1.4rem;
  //
  @include tablet {
    margin-top: 1.5rem;
    font-size: 1.6rem;
  }
}

.entry-toc__target {
  color: $text-color;
}
</style>

<script>
export default {
  name: 'EntryToc',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isOpen: false,
      counter: 0
    }
  }
}
</script>
