<template>
  <ul class="Ads-list">
    <li class="Ads-list_item">
      <adsbygoogle :ad-slot="'1102437429'" />
    </li>
    <li class="Ads-list_item">
      <a href="https://www.amazon.co.jp/dp/4767817358/ref=as_li_ss_il?_encoding=UTF8&colid=37QKPZ7VSHBB8&coliid=I1TH4VXMY4FORU&linkCode=li3&tag=utousui-22&linkId=e34c02744d84af010d64794df21dd7a3" target="_blank">
        <img border="0" src="//ws-fe.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=4767817358&Format=_SL250_&ID=AsinImage&MarketPlace=JP&ServiceVersion=20070822&WS=1&tag=utousui-22">
      </a><img
        src="https://ir-jp.amazon-adsystem.com/e/ir?t=utousui-22&l=li3&o=9&a=4767817358"
        width="1"
        height="1"
        border="0"
        alt=""
        style="margin:0 !important;border:none !important;"
      >
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.Ads-list {
  display: flex;
  justify-content: space-around;
  margin-top: 4rem;
  //
  @include tablet {
    margin-top: 6rem;
  }
}

.Ads-list_item {
  //
  width: 100%;
  min-width: 330px;
  padding: 0.8rem;
  border: 6px double $black;
  //
  @include mobile {
    //
    &:last-child {
      display: none;
    }
  }
  //
  @include tablet {
    width: 40%;
  }
}
</style>

<script>
export default {
  name: 'EntryAdFoot'
}
</script>
