import 'lazysizes'
import 'alpine-hotwire-turbo-adapter'
import 'alpinejs'
import '@hotwired/turbo'
import { listen } from 'quicklink'

import 'normalize.css'
import '../fonts/untitled-sans/stylesheet.css'
import '../fonts/Calibre/stylesheet.css'
import '../fonts/jetbrains/stylesheet.css'
import '../css/variables.css'
import '../css/app.css'
import '../css/header.css'
import '../css/sidebar.css'
import '../css/toc.css'
import '../css/markdown.css'

window.initializeCodegroups = function () {
  console.log('here>')
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
 * Trigger quick links preloading
 */
document.addEventListener('turbo:load', () => {
  listen({
    el: document.querySelector('#sidebar'),
  })
})

/**
 * Update active link onclick
 */
// document.addEventListener('turbo:click', (event) => {
//   document.querySelectorAll('#sidebar li').forEach((element) => element.classList.remove('active'))
//   event.target.parentNode.classList.add('active')
// })

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

// let sidebar = document.querySelector('.sidebar')
// let top = localStorage.getItem('sidebar-scroll')

// if (top !== null) {
//   sidebar.scrollTop = parseInt(top, 10)
// }
// window.addEventListener('beforeunload', () => {
//   localStorage.setItem('sidebar-scroll', sidebar.scrollTop)
// })
