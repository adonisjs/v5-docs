import 'lazysizes'
import '@hotwired/turbo'
import 'alpine-hotwire-turbo-adapter'
import 'alpinejs'
import { listen } from 'quicklink'

/**
 * Css imports. Do not change the order
 */
import 'normalize.css'
import '../fonts/Calibre/stylesheet.css'
import '../fonts/jetbrains/stylesheet.css'
import '../css/variables.css'
import '../css/app.css'
import '../css/header.css'
import '../css/sidebar.css'
import '../css/toc.css'
import '../css/markdown.css'

/**
 * Alpine component for codegroup tabs
 */
window.initializeCodegroups = function initializeCodegroups () {
  return {
    activeTab: 1,
    changeTab(index, element) {
      this.$refs.highlighter.style.left = `${element.offsetLeft}px`
      this.$refs.highlighter.style.width = `${element.clientWidth}px`
      this.activeTab = index
    },
    mounted() {
      this.changeTab(1, this.$refs.firstTab)
      setTimeout(() => {
        if (this.$el.classList) {
          this.$el.classList.add('ready')
        }
      })
    },
  }
}

window.initializeSearch = function initializeSearch (apiKey) {
  return {
    init() {
      Promise.all([
        import(/* webpackChunkName: "docsearch" */ '@docsearch/js'),
        import(/* webpackChunkName: "docsearch" */ '@docsearch/css')
      ]).then(([docsearch]) => {
        docsearch = docsearch.default
        docsearch({
          apiKey: apiKey,
          indexName: 'adonisjs_next',
          container: '#algolia-search-input',
        })
      }).catch(console.error)
    }
  }
}

/**
 * Alpine component to navigate from a select box
 */
window.selectBoxNavigate = function () {
  return {
    mounted() {
      this.$el.querySelectorAll('option').forEach((element) => {
        if (element.value === window.location.pathname) {
          element.selected = 'selected'
        }
      })
    },

    navigateTo(e) {
      window.location = e.target.value
    }
  }
}

/**
 * Trigger quick links preloading
 */
document.addEventListener('turbo:load', () => {
  listen({
    el: document.querySelector('#sidebar'),
  })
})

/**
 * Manage scroll position of elements
 */
const scrollPositions = {}
document.addEventListener('turbo:before-render', () => {
  document.querySelectorAll('[data-maintain-scroll]').forEach((element) => {
    scrollPositions[element.id] = element.scrollTop
  })
})
document.addEventListener('turbo:render', () => {
  document.querySelectorAll('[data-maintain-scroll]').forEach((element) => {
    if (scrollPositions[element.id]) {
      element.scrollTop = scrollPositions[element.id]
    }
  })
})

/**
 * Scroll the active sidebar item into the view on page load
 */
const activeSidebarItem = document.querySelector('.sidebar li.active')
if (activeSidebarItem) {
  activeSidebarItem.scrollIntoView({
    block: 'center',
  })
}
