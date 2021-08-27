import 'lazysizes'
import 'unpoly'
import Alpine from 'alpinejs'
import { listen } from 'quicklink'

/**
 * Css imports. Do not change the order
 */
import 'normalize.css'
import 'unpoly/unpoly.css'
import '../fonts/Calibre/stylesheet.css'
import '../fonts/jetbrains/stylesheet.css'
import '../css/variables.css'
import '../css/app.css'
import '../css/header.css'
import '../css/sidebar.css'
import '../css/toc.css'
import '../css/markdown.css'
import '../css/carbon-ads.css'

/**
 * Prefix zone name to the search results
 */
function prefixZoneName(title, docUrl) {
  if (!title) {
    return title
  }

  if (docUrl.includes('https://docs.adonisjs.com/reference/')) {
    return `Reference / ${title}`
  }

  if (docUrl.includes('https://docs.adonisjs.com/guides/')) {
    return `Guides / ${title}`
  }

  if (docUrl.includes('https://docs.adonisjs.com/cookbooks/')) {
    return `Cookbooks / ${title}`
  }

  if (docUrl.includes('https://docs.adonisjs.com/releases/')) {
    return `Releases / ${title}`
  }

  return title
}

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

Alpine.data('search', function (apiKey) {
  return {
    init() {
      Promise.all([
        import(/* webpackChunkName: "docsearch" */ '@docsearch/js'),
        import(/* webpackChunkName: "docsearch" */ '@docsearch/css'),
      ])
        .then(([docsearch]) => {
          docsearch = docsearch.default
          docsearch({
            apiKey: apiKey,
            indexName: 'adonisjs_next',
            container: '#algolia-search-input',
            transformItems: (items) => {
              return items.map((item) => {
                item.hierarchy.lvl0 = prefixZoneName(item.hierarchy.lvl0, item.url)
                return item
              })
            },
          })
        })
        .catch(console.error)
    },
  }
})

/**
 * Alpine component to navigate from a select box
 */
Alpine.data('selectBoxNavigate', function () {
  return {
    init() {
      this.$el.querySelectorAll('option').forEach((element) => {
        if (element.value === window.location.pathname) {
          element.selected = 'selected'
        }
      })
    },

    visitUrl(e) {
      up.navigate({ url: e.target.value })
    },
  }
})

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

Alpine.data('offCanvasMenu', function () {
  return {
    opened: false,
    open() {
      this.opened = true
    },
    close() {
      this.opened = false
    },
  }
})

Alpine.data('prefetch', function () {
  return {
    init() {
      listen({
        el: this.$el,
      })
    },
  }
})

Alpine.start()
