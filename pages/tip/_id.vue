<template>
  <Wrapper>
    <article class="entry">
      <EntryHead :article="article" />
      <EntryContent :article="article" />
      <LazyImage :src="featuredImage.source_url" :alt="featuredImage.alt" />
      <EntryAd :article="article" />
      <EntrySns :article="article" />
      <EntryTag :article="article" />
      <EntryRelated :article="article" />
      <EntryNav :article="article" />
    </article>
  </Wrapper>
</template>

<style lang="scss" scoped>
.entry {
  max-width: 940px;
  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
  //
  @include desktop {
    padding-right: 30px;
    padding-left: 30px;
  }
  //
  @include desktop {
    padding-right: 40px;
    padding-left: 40px;
  }
}

.entry_demo {
  position: relative;
  z-index: 1;
  display: inline-block;
  margin-bottom: 3rem;
  font-size: 5rem;
  font-weight: bold;
  color: $black;
  text-transform: uppercase;
  transition: 0.45s $easeOutQuart;
  //
  &::after {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: -1;
    width: 60px;
    height: 60px;
    content: '';
    background: transparent;
    background-image: radial-gradient($black 20%, transparent 0),
      radial-gradient($black 20%, transparent 0);
    background-position: 0 0, 5px 5px;
    background-size: 10px 10px;
    transition: 0.45s $easeOutQuart;
    transform: translate(-50%, -50%) rotate(45deg);
    clip-path: polygon(
      0 0,
      59% 0,
      100% 0,
      100% 50%,
      100% 99%,
      60% 100%,
      0 100%
    );
  }

  //
  &:hover {
    color: $primary-color;
    text-decoration: none;
    //
    &::after {
      width: 200px;
      height: 200px;
      background: transparent;
      background-image: radial-gradient(rgba($black, 0.8) 20%, transparent 0),
        radial-gradient(rgba($black, 0.8) 20%, transparent 0);
      background-position: 0 0, 8px 8px;
      background-size: 16px 16px;
      border-radius: 50%;
      transform: translate(-50%, -50%) rotate(0);
      clip-path: polygon(
        0% 20%,
        60% 20%,
        60% 0%,
        100% 50%,
        60% 100%,
        60% 80%,
        0% 80%
      );
      clip-path: polygon(
        0 30%,
        50% 30%,
        50% 0,
        100% 50%,
        50% 100%,
        50% 70%,
        0 70%
      );
    }
  }
}

.entry_clip-thumb-full {
  margin-top: 120px;
}

//
// ---------------------------------------------------------
// toc
// ---------------------------------------------------------
//
//
// toc
// - - - - - - - - - -
.toc {
  position: relative;
  display: inline-block;
  padding: 1rem 1rem 2rem;
  border-top: 6px double currentColor;
  border-bottom: 6px solid currentColor;
  transition: 0.3s;
  //
  @include tablet {
    margin-bottom: 2rem;
  }
  //
  &.is-active {
    padding-bottom: 3rem;
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

.toc_title {
  margin-bottom: 1rem;
  font-size: 2rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  cursor: pointer;
  //
  @include desktop {
    font-size: 2.4rem;
  }
  //
  &::after {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    font-size: 1.8rem;
    font-style: italic;
    content: 'open';
    transition: 0.2s $easeInOutQuart;
    transform: translateX(-50%);
    //
    .toc_title:hover & {
      letter-spacing: 0.6em;
    }
    //
    .toc.is-active & {
      content: 'close';
    }
  }
}

.toc_list {
  display: none;
  padding-left: 2rem;
  line-height: 1.35;
  text-align: left;
  //
  @include tablet {
    padding-top: 0.5rem;
    padding-bottom: 1rem;
    font-size: 1.6em;
  }
}

.toc_item {
  letter-spacing: 0.1em;
  list-style-type: decimal;
  //
  + .toc_item {
    margin-top: 1rem;
  }
  //
  @include tablet {
    //
    + .toc_item {
      margin-top: 1.5rem;
    }
  }
}

.toc_item-child {
  margin-top: 0.6em;
  //
  @include tablet {
    margin-top: 0.8rem;
    //
    + .toc_item-child {
      //
    }
  }
}

.toc_target {
  color: $text-color;
}

// ---------------------------------------------------------
// realate
// ---------------------------------------------------------
//
//

// ---------------------------------------------------------
// navi
// ---------------------------------------------------------
//
//

// ---------------------------------------------------------
// sns
// ---------------------------------------------------------
//
//

// ---------------------------------------------------------
// tag
// ---------------------------------------------------------
//
//
</style>

<script>
import nuxtend from 'nuxtend'

import Wrapper from '~/components/Wrapper'
import LazyImage from '~/components/LazyImage'
import EntryHead from '~/components/EntryHead'
import EntryContent from '~/components/EntryContent'
// import EntrySns from '~/components/EntrySns'
// import EntryTag from '~/components/EntryTag'
// import EntryNav from '~/components/EntryNav'
// import EntryRelated from '~/components/EntryRelated'

import SingleAsyncData from '~/mixins/Single'

export default nuxtend({
  mixins: [SingleAsyncData],

  components: {
    LazyImage,
    Wrapper,
    EntryHead,
    EntryContent,
    EntryAd: () => import('~/components/EntryAd'),
    EntrySns: () => import('~/components/EntrySns'),
    EntryTag: () => import('~/components/EntryTag'),
    EntryRelated: () => import('~/components/EntryRelated'),
    EntryNav: () => import('~/components/EntryNav')
  },

  data() {
    return {
      postType: 'tip'
    }
  }
})
</script>
