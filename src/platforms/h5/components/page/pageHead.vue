<template>
  <uni-page-head :uni-page-head-type="type">
    <div
      :style="{transitionDuration:duration,transitionTimingFunction:timingFunc,backgroundColor:bgColor,color:textColor}"
      :class="headClass"
      class="uni-page-head"
    >
      <div class="uni-page-head-hd">
        <div
          v-show="backButton"
          class="uni-page-head-btn"
          @click="_back"
        >
          <i
            :style="{color:color,fontSize:'27px'}"
            class="uni-btn-icon"
          >&#xe601;</i>
        </div>
        <template v-for="(btn,index) in btns">
          <div
            v-if="btn.float === 'left'"
            :key="index"
            :style="{backgroundColor: type==='transparent'?btn.background:'transparent',width:btn.width}"
            :badge-text="btn.badgeText"
            :class="{'uni-page-head-btn-red-dot':btn.redDot||btn.badgeText,'uni-page-head-btn-select':btn.select}"
            class="uni-page-head-btn"
          >
            <i
              :style="_formatBtnStyle(btn)"
              class="uni-btn-icon"
              @click="_onBtnClick(index)"
              v-html="_formatBtnFontText(btn)"
            />
          </div>
        </template>
      </div>
      <div
        v-if="!searchInput"
        class="uni-page-head-bd"
      >
        <div
          :style="{fontSize:titleSize,opacity:type==='transparent'?0:1}"
          class="uni-page-head__title"
        >
          <i
            v-if="loading"
            class="uni-loading"
          />
          <img
            v-if="titleImage!==''"
            :src="titleImage"
            class="uni-page-head__title_image"
          >
          <template v-else>
            {{ titleText }}
          </template>
        </div>
      </div>
      <div
        v-if="searchInput"
        :style="{'border-radius':searchInput.borderRadius,'background-color':searchInput.backgroundColor}"
        class="uni-page-head-search"
      >
        <div
          :style="{color:searchInput.placeholderColor}"
          :class="[`uni-page-head-search-placeholder-${focus || showPlaceholder ? 'left' : searchInput.align}`]"
          class="uni-page-head-search-placeholder"
          v-text="showPlaceholder || composing ? '' : searchInput.placeholder"
        />
        <v-uni-input
          ref="input"
          v-model="text"
          :focus="searchInput.autoFocus"
          :disabled="searchInput.disabled"
          :style="{color:searchInput.color}"
          :placeholder-style="`color:${searchInput.placeholderColor}`"
          class="uni-page-head-search-input"
          confirm-type="search"
          @focus="_focus"
          @blur="_blur"
          @update:value="_input"
        />
        <i
          v-if="text"
          class="uni-icon-clear"
          @click="_clearInput"
        >&#xea0f;</i>
      </div>
      <div class="uni-page-head-ft">
        <template v-for="(btn,index) in btns">
          <div
            v-if="btn.float !== 'left'"
            :key="index"
            :style="{backgroundColor: type==='transparent'?btn.background:'transparent',width:btn.width}"
            :badge-text="btn.badgeText"
            :class="{'uni-page-head-btn-red-dot':btn.redDot||btn.badgeText,'uni-page-head-btn-select':btn.select}"
            class="uni-page-head-btn"
          >
            <i
              :style="_formatBtnStyle(btn)"
              class="uni-btn-icon"
              @click="_onBtnClick(index)"
              v-html="_formatBtnFontText(btn)"
            />
          </div>
        </template>
      </div>
    </div>
    <div
      v-if="type!=='transparent'&&type!=='float'"
      :class="{'uni-placeholder-titlePenetrate': titlePenetrate}"
      class="uni-placeholder"
    />
  </uni-page-head>
</template>
<style>
  uni-page-head {
    display: block;
    box-sizing: border-box;
  }

  uni-page-head .uni-page-head {
    position: fixed;
    left: var(--window-left);
    right: var(--window-right);
    height: 44px;
    height: calc(44px + constant(safe-area-inset-top));
    height: calc(44px + env(safe-area-inset-top));
    padding: 7px 3px;
    padding-top: calc(7px + constant(safe-area-inset-top));
    padding-top: calc(7px + env(safe-area-inset-top));
    display: flex;
    overflow: hidden;
    justify-content: space-between;
    box-sizing: border-box;
    z-index: 998;
    color: #fff;
    background-color: #000;
    transition-property: all;
  }

  uni-page-head .uni-page-head-titlePenetrate,
  uni-page-head .uni-page-head-titlePenetrate .uni-page-head-bd,
  uni-page-head .uni-page-head-titlePenetrate .uni-page-head-bd * {
    pointer-events: none;
  }

  uni-page-head .uni-page-head-titlePenetrate * {
    pointer-events: auto;
  }

  uni-page-head .uni-page-head.uni-page-head-transparent .uni-page-head-ft>div {
    justify-content: center;
  }

  uni-page-head .uni-page-head~.uni-placeholder {
    width: 100%;
    height: 44px;
    height: calc(44px + constant(safe-area-inset-top));
    height: calc(44px + env(safe-area-inset-top));
  }

  uni-page-head .uni-placeholder-titlePenetrate {
    pointer-events: none;
  }

  uni-page-head .uni-page-head * {
    box-sizing: border-box;
  }

  uni-page-head .uni-page-head-hd {
    display: flex;
    align-items: center;
    font-size: 16px;
  }

  uni-page-head .uni-page-head-bd {
    position: absolute;
    left: 70px;
    right: 70px;
    min-width: 0;
  }

  .uni-page-head-btn {
    position: relative;
    width: auto;
    margin: 0 2px;
    word-break: keep-all;
    white-space: pre;
    cursor: pointer;
  }

  .uni-page-head-transparent .uni-page-head-btn {
    display: flex;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  uni-page-head .uni-btn-icon {
    overflow: hidden;
    min-width: 1em;
  }

  .uni-page-head-btn-red-dot::after {
    content: attr(badge-text);
    position: absolute;
    right: 0;
    top: 0;
    background-color: red;
    color: white;
    width: 18px;
    height: 18px;
    line-height: 18px;
    border-radius: 18px;
    overflow: hidden;
    transform: scale(0.5) translate(40%, -40%);
    transform-origin: 100% 0;
  }

  .uni-page-head-btn-red-dot[badge-text]::after {
    font-size: 12px;
    width: auto;
    min-width: 18px;
    max-width: 42px;
    text-align: center;
    padding: 0 3px;
    transform: scale(0.7) translate(40%, -40%);
  }

  .uni-page-head-btn-select>.uni-btn-icon::after {
    display: inline-block;
    font-family: "unibtn";
    content: "\e601";
    margin-left: 2px;
    transform: rotate(-90deg) scale(0.8);
  }

  .uni-page-head-search {
    position: relative;
    display: flex;
    flex: 1;
    margin: 0 2px;
    line-height: 30px;
    font-size: 15px;
  }

  .uni-page-head-search-input {
    width: 100%;
    height: 100%;
    padding-left: 34px;
    text-align: left;
  }

  .uni-page-head-search-placeholder {
    position: absolute;
    max-width: 100%;
    height: 100%;
    padding-left: 34px;
    overflow: hidden;
    word-break: keep-all;
    white-space: pre;
  }

  .uni-page-head-search-placeholder-right {
    right: 0;
  }

  .uni-page-head-search-placeholder-center {
    left: 50%;
    transform: translateX(-50%);
  }

  .uni-page-head-search-placeholder::before {
    position: absolute;
    top: 0;
    left: 2px;
    width: 30px;
    content: "\ea0e";
    display: block;
    font-size: 20px;
    font-family: "uni";
    text-align: center;
  }

  uni-page-head .uni-page-head-ft {
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
    font-size: 13px;
  }

  uni-page-head .uni-page-head__title {
    font-weight: bold;
    font-size: 16px;
    line-height: 30px;
    text-align: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  uni-page-head .uni-page-head__title .uni-loading {
    width: 16px;
    height: 16px;
    margin-top: -3px;
  }

  uni-page-head .uni-page-head__title .uni-page-head__title_image {
    width: auto;
    height: 26px;
    vertical-align: middle;
  }

  uni-page-head .uni-page-head-shadow {
    overflow: visible;
  }

  uni-page-head .uni-page-head-shadow::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    height: 5px;
    background-size: 100% 100%;
  }

  uni-page-head .uni-page-head-shadow-grey::after {
    background-image: url("https://cdn.dcloud.net.cn/img/shadow-grey.png");
  }

  uni-page-head .uni-page-head-shadow-blue::after {
    background-image: url("https://cdn.dcloud.net.cn/img/shadow-blue.png");
  }

  uni-page-head .uni-page-head-shadow-green::after {
    background-image: url("https://cdn.dcloud.net.cn/img/shadow-green.png");
  }

  uni-page-head .uni-page-head-shadow-orange::after {
    background-image: url("https://cdn.dcloud.net.cn/img/shadow-orange.png");
  }

  uni-page-head .uni-page-head-shadow-red::after {
    background-image: url("https://cdn.dcloud.net.cn/img/shadow-red.png");
  }

  uni-page-head .uni-page-head-shadow-yellow::after {
    background-image: url("https://cdn.dcloud.net.cn/img/shadow-yellow.png");
  }

  uni-page-head .uni-icon-clear {
    align-self: center;
    padding-right: 5px;
  }
</style>
<script>
import appendCss from 'uni-platform/helpers/append-css'
import getRealPath from 'uni-platform/helpers/get-real-path'

import transparent from './transparent'

const FONTS = {
  forward: '&#xe600;',
  back: '&#xe601;',
  share: '&#xe602;',
  favorite: '&#xe604;',
  home: '&#xe605;',
  menu: '&#xe606;',
  close: '&#xe650;'
}
export default {
  name: 'PageHead',
  mixins: [transparent],
  props: {
    backButton: {
      type: Boolean,
      default: true
    },
    backgroundColor: {
      type: String,
      default () {
        return this.type === 'transparent' ? '#000' : '#F8F8F8'
      }
    },
    textColor: {
      type: String,
      default: '#fff'
    },
    titleText: {
      type: String,
      default: ''
    },
    duration: {
      type: String,
      default: '0'
    },
    timingFunc: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    titleSize: {
      type: String,
      default: '16px'
    },
    type: {
      default: 'default',
      validator (value) {
        return ['default', 'transparent', 'float'].indexOf(value) !== -1
      }
    },
    coverage: {
      type: String,
      default: '132px'
    },
    buttons: {
      type: Array,
      default () {
        return []
      }
    },
    searchInput: {
      type: [Object, Boolean],
      default () {
        return false
      }
    },
    titleImage: {
      type: String,
      default: ''
    },
    titlePenetrate: {
      type: Boolean,
      default: false
    },
    shadow: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      focus: false,
      text: '',
      composing: false,
      showPlaceholder: false
    }
  },
  computed: {
    btns () {
      const btns = []
      const fonts = {}
      if (this.buttons.length) {
        this.buttons.forEach(button => {
          const btn = Object.assign({}, button)
          if (btn.fontSrc && !btn.fontFamily) {
            const fontSrc = btn.fontSrc = getRealPath(btn.fontSrc)
            let fontFamily
            if (fontSrc in fonts) {
              fontFamily = fonts[fontSrc]
            } else {
              fontFamily = `font${Date.now()}`
              fonts[fontSrc] = fontFamily
              const cssText =
                  `@font-face{font-family: "${fontFamily}";src: url("${fontSrc}") format("truetype")}`
              appendCss(cssText, 'uni-btn-font-' + fontFamily)
            }
            btn.fontFamily = fontFamily
          }
          btn.color = this.type === 'transparent' ? '#fff' : (btn.color || this.textColor)
          let fontSize = btn.fontSize || (this.type === 'transparent' || /\\u/.test(btn.text) ? '22px' : '27px')
          if (/\d$/.test(fontSize)) {
            fontSize += 'px'
          }
          btn.fontSize = fontSize
          btn.fontWeight = btn.fontWeight || 'normal'
          btns.push(btn)
        })
      }
      return btns
    },
    headClass () {
      const shadowColorType = this.shadow.colorType
      const data = {
        'uni-page-head-transparent': this.type === 'transparent',
        'uni-page-head-titlePenetrate': this.titlePenetrate,
        'uni-page-head-shadow': shadowColorType
      }
      if (shadowColorType) {
        data[`uni-page-head-shadow-${shadowColorType}`] = shadowColorType
      }
      return data
    }
  },
  mounted () {
    if (this.searchInput) {
      const input = this.$refs.input
      input.$watch('composing', val => {
        this.composing = val
      })
      input.$watch('valueSync', val => {
        this.showPlaceholder = !!val
      })
      if (this.searchInput.disabled) {
        input.$el.addEventListener('click', () => {
          UniServiceJSBridge.emit('onNavigationBarSearchInputClicked', '')
        })
      } else {
        input.$refs.input.addEventListener('keyup', event => {
          if (event.key.toUpperCase() === 'ENTER') {
            UniServiceJSBridge.emit('onNavigationBarSearchInputConfirmed', {
              text: this.text
            })
          }
        })
        input.$refs.input.addEventListener('focus', () => {
          UniServiceJSBridge.emit('onNavigationBarSearchInputFocusChanged', {
            focus: true
          })
        })
        input.$refs.input.addEventListener('blur', () => {
          UniServiceJSBridge.emit('onNavigationBarSearchInputFocusChanged', {
            focus: false
          })
        })
      }
    }
  },
  methods: {
    _back () {
      if (getCurrentPages().length === 1) {
        uni.reLaunch({
          url: '/'
        })
      } else {
        uni.navigateBack({
          from: 'backbutton'
        })
      }
    },
    _onBtnClick (index) {
      UniServiceJSBridge.emit('onNavigationBarButtonTap', Object.assign({}, this.btns[index], {
        index
      }))
    },
    _formatBtnFontText (btn) {
      if (btn.fontSrc && btn.fontFamily) {
        return btn.text.replace('\\u', '&#x')
      } else if (FONTS[btn.type]) {
        return FONTS[btn.type]
      }
      return btn.text || ''
    },
    _formatBtnStyle (btn) {
      const style = {
        color: btn.color,
        fontSize: btn.fontSize,
        fontWeight: btn.fontWeight
      }
      if (btn.fontFamily) {
        style.fontFamily = btn.fontFamily
      }
      return style
    },
    _focus () {
      this.focus = true
    },
    _blur () {
      this.focus = false
    },
    _input (text) {
      UniServiceJSBridge.emit('onNavigationBarSearchInputChanged', {
        text
      })
    },
    _clearInput () {
      this.text = ''
      this._input(this.text)
    }
  }
}
</script>
