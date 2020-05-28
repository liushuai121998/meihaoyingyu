import router from '@system.router'
import clipboard from '@system.clipboard'
import prompt from '@system.prompt'
import ad from '@service.ad'
import audio from '@system.audio'
import media from '@system.media'
export default Custom_page({
  // 页面级组件的数据模型，影响传入数据的覆盖机制：private内定义的属性不允许被覆盖
  private: {
    newsList: [],
    footerAdShow: false,
    modalShow: false,
    dateNow: '',
    footerAd: {}
  },
  onInit() {
    this.getData()
    //   this.queryFooterAd()
    this.dateNow = this.$app.$def.parseTime(Date.now(), '{y}-{m}-{d}')
    this.insertAd()
    this.queryFooterAd()
  },
  async getData() {
    const $appDef = this.$app.$def
    // prompt.showToast({
    //   message: $appDef.parseTime(Date.now(), '{y}-{m}-{d}')
    // })
    const {data} = await $appDef.$http.get(`/everyday/index?key=${$appDef.key}&rand=1&date=${$appDef.parseTime(Date.now(), '{y}-{m}-{d}')}`)
    if(data.code === 200) {
      this.newsList = data.newslist
    }
  },
  onShow() {
  },
  clickPress(item, e) {
    media.previewImage({
      current: item.imgurl,
      uris: [
        item.imgurl
      ],
      success: function() {
        console.log('preview success')
      },
      fail: function(data, code) {
        console.log('preview fail, code = ${code}')
      }
    })
  },
  longPress(item, e) {
    clipboard.set({
      text: `${item.content}\n${item.note}`,
      success () {
        prompt.showToast({
          message: '复制成功'
        })
      }
    })
  },
  hideFooterAd() {
      this.footerAdShow = false
      this.nativeAd && this.nativeAd.destroy()
  },
  queryFooterAd() {
    if(!ad.createNativeAd) {
      return 
    }
    //   原生广告
    this.nativeAd = ad.createNativeAd({
        adUnitId: '710f447121654edd9b3fadc32e8e3e8e'
    })
    this.nativeAd.load()
    this.nativeAd.onLoad((res) => {
      this.footerAd = res.adList[0]
      // prompt.showToast({
      //   message: this.footerAd
      // })
      this.footerAdShow = true
    })
    // // 上报广告曝光
    // this.nativeAd.reportAdShow({
    //     adId: ""
    // })
    // // 上报广告点击
    // this.nativeAd.reportAdClick({
    //     adId: ""
    // })
  },
  reportAdClick() {
    this.nativeAd && this.nativeAd.reportAdClick({
        adId: this.footerAd.adId
    })
  },
  reportAdShow() {
    this.nativeAd && this.nativeAd.reportAdShow({
        adId: this.footerAd.adId
    })
  },
//   插屏广告
  insertAd() {
    if(ad.createInterstitialAd) {
      this.interstitialAd = ad.createInterstitialAd({
          adUnitId: 'c734f27e9733409a88ff2160229c5c25'
      })
      this.interstitialAd.onLoad(()=> {
          this.interstitialAd.show();
      })
    }
  },
  onHide() {
    this.interstitialAd && this.interstitialAd.destroy() 
  },
  closeModal() {
      this.modalShow = false
  },
  playAudio() {
    const tts = this.newsList[0].tts
    if(tts) {
      audio.src = this.newsList[0].tts
      audio.play()
    }
  }
})