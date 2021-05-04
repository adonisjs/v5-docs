import 'lazysizes'
import 'alpine-hotwire-turbo-adapter'
import 'alpinejs'
import '@hotwired/turbo'
import { listen } from 'quicklink'

import 'normalize.css'
import '../fonts/Calibre/stylesheet.css'
import '../fonts/jetbrains/stylesheet.css'
import '../css/variables.css'
import '../css/app.css'
import '../css/header.css'
import '../css/sidebar.css'
import '../css/toc.css'
import '../css/markdown.css'

window.initializeCodegroups = function () {
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

/**
 * Navigates from a select box
 */
window.selectBoxNavigate = function () {
  return {
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

document.querySelector('.sidebar li.active').scrollIntoView({
  block: 'center',
})
