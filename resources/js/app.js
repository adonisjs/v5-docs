import 'unpoly'
import 'lazysizes'
import Alpine from 'alpinejs'
import { listen } from 'quicklink'
import docsearch from '@docsearch/js'

/**
 * Css imports. Do not change the order
 */
import 'normalize.css'
import '@docsearch/css'
import 'unpoly/unpoly.css'

import '../css/variables.css'
import '../css/light_mode.css'
import '../css/dark_mode.css'
import '../css/app.css'
import '../css/sponsors.css'
import '../css/header.css'
import '../css/doc_search.css'
import '../css/sidebar.css'
import '../css/toc.css'
import '../css/markdown.css'
import '../css/carbon_ad.css'

up.feedback.config.navSelectors = ['[up-nav]']

/**
 * Alpine component for codegroup tabs
 */
Alpine.data('codegroups', function () {
  return {
    activeTab: 1,

    changeTab(index, element) {
      this.$refs.highlighter.style.left = `${element.offsetLeft}px`
      this.$refs.highlighter.style.width = `${element.clientWidth}px`
      this.activeTab = index
    },

    init() {
      this.changeTab(1, this.$refs.firstTab)
      setTimeout(() => {
        if (this.$el.classList) {
          this.$el.classList.add('ready')
        }
      })
    },
  }
})

/**
 * Alpine component to copy the text contents of an element
 * to the Clipboard
 */
Alpine.data('copyToClipboard', function () {
  return {
    copied: false,
    copy() {
      const code = this.$refs.content.textContent
      navigator.clipboard.writeText(code)

      this.copied = true
      setTimeout(() => (this.copied = false), 1500)
    },
  }
})

/**
 * Algolia search
 */
Alpine.data('search', function (apiKey) {
  return {
    init() {
      docsearch({
        container: this.$el,
        // appId: 'JK0LZ5Z477',
        appId: 'R2IYF7ETH7',
        // indexName: 'adonisjs_next',
        indexName: 'docsearch',
        // apiKey: apiKey,
        apiKey: '599cec31baffa4868cae4e79f180729b',
      })
    },
  }
})

/**
 * Initiates the carbon ad
 */
Alpine.data('carbonAd', function (zoneId) {
  return {
    init() {
      const script = document.createElement('script')
      script.setAttribute('type', 'text/javascript')
      script.setAttribute(
        'src',
        `//cdn.carbonads.com/carbon.js?serve=${zoneId}&placement=adonisjscom`
      )
      script.setAttribute('id', '_carbonads_js')
      this.$el.appendChild(script)
    },
  }
})

/**
 * Off canvas menu store
 */
Alpine.store('offCanvasMenu', {
  opened: false,
  close() {
    this.opened = false
  },
  open() {
    this.opened = true
  },
  toggle() {
    this.opened = !this.opened
  },
})

/**
 * Prefetches all the anchors tags inside a given element
 */
Alpine.data('prefetch', function () {
  return {
    init() {
      listen({
        el: this.$el,
      })
    },
  }
})

/**
 * The component for managing the dark mode
 */
Alpine.data('darkModeSwitch', function () {
  return {
    mode: localStorage.getItem('colorScheme') || 'system',
    colorSchemeListener: null,

    toSystemMode() {
      localStorage.setItem('colorScheme', 'system')
      this.mode = 'system'
      window.syncModeColor(window.getModeColor())
    },

    toDarkMode() {
      localStorage.setItem('colorScheme', 'dark')
      this.mode = 'dark'
      window.syncModeColor(window.getModeColor())
    },

    toLightMode() {
      localStorage.setItem('colorScheme', 'light')
      this.mode = 'light'
      window.syncModeColor(window.getModeColor())
    },

    init() {
      this.colorSchemeListener = function () {
        if (this.mode === 'system') {
          window.syncModeColor(window.getModeColor())
        }
      }.bind(this)

      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.colorSchemeListener)
    },

    destroy() {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.colorSchemeListener)
    },
  }
})

/**
 * Tracks the scrolling of windows and activates the
 * hash link next to it.
 */
Alpine.data('trackScroll', function () {
  return {
    scrollListener: null,

    setActiveTableOfContents(scrollContainerIntoView) {
      const links = Array.from(this.$el.querySelectorAll('a'))

      let lastVisible =
        links
          .slice()
          .reverse()
          .find((link) => {
            const el = document.querySelector(link.hash)
            return el.getBoundingClientRect().top <= 64
          }) ?? links[0]

      links.forEach((link) => {
        if (link === lastVisible) {
          link.classList.add('up-current')
          if (scrollContainerIntoView) {
            link.scrollIntoView({
              block: 'center',
            })
          }
        } else {
          link.classList.remove('up-current')
        }
      })
    },

    init() {
      this.scrollListener = function () {
        this.setActiveTableOfContents(false)
      }.bind(this)

      this.$nextTick(() => {
        this.setActiveTableOfContents(true)
        window.addEventListener('scroll', this.scrollListener, { passive: true })
      })
    },

    destroy() {
      window.removeEventListener('scroll', this.scrollListener)
    }
  }
})

/**
 * Scroll the active left sidebar item into the view on page load
 */
const activeSidebarItem = document.querySelector('.sidebar a.up-current')
if (activeSidebarItem) {
  activeSidebarItem.scrollIntoView({
    block: 'center',
  })
}

Alpine.start()
