<template>
  <Wrapper>
    <SectionEntry>
      <EntryHead :article="article" />
      <EntryAd :ad-slot="'6597241020'" />
      <EntryDemo :article="article" />
      <EntryContent :article="article" :toc="true" />
      <LazyImage :src="featuredImage.source_url" :alt="`${article.title}のアイキャッチ画像`" />
      <EntryAd :ad-slot="'1102437429'" :article="article" />
      <EntrySns :post-type="postType" :article="article" />
      <EntryTag :article="article" />
      <EntryRelated :article="article" />
      <EntryNav :article="article" />
      <EntryAdFoot />
    </SectionEntry>
  </Wrapper>
</template>

<script>
import nuxtend from 'nuxtend'

import Wrapper from '~/components/Wrapper'
import LazyImage from '~/components/LazyImage'
import EntryHead from '~/components/EntryHead'
import EntryContent from '~/components/EntryContent'
import EntryDemo from '~/components/EntryDemo'
import SectionEntry from '~/components/SectionEntry'

import SingleAsyncData from '~/mixins/Single'

export default nuxtend({
  mixins: [SingleAsyncData],

  components: {
    LazyImage,
    Wrapper,
    EntryHead,
    EntryContent,
    EntryDemo,
    SectionEntry,
    EntryAd: () => import('~/components/EntryAd'),
    EntryAdFoot: () => import('~/components/EntryAdFoot'),
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
