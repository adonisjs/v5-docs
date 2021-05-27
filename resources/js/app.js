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
window.initializeCodegroups = () => ({
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
})

window.initializeCode = () => ({
  copyToClipboard() {
    const code = this.$el.querySelector('pre').textContent
    navigator.clipboard.writeText(code)

    this.$refs.copyButton.innerText = 'Copied'
    setTimeout(() => (this.$refs.copyButton.innerText = 'Copy to Clipboard'), 1000)
  },
})

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

window.initializeSearch = (apiKey) => ({
  mounted() {
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
})

/**
 * Alpine component to navigate from a select box
 */
window.selectBoxNavigate = () => ({
  mounted() {
    this.$el.querySelectorAll('option').forEach((element) => {
      if (element.value === window.location.pathname) {
        element.selected = 'selected'
      }
    })
  },

  navigateTo(e) {
    window.location = e.target.value
  },
})

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

/**
 * Intersection Observer to highlight the in-page header links
 * Directly uses the Browser's IntersectionObserver API. No dependencies.
 */
window.asideHighlights = () => ({
  /**
   * Initialise the intersection observer
   */
  init() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    }

    let observer = new IntersectionObserver(callback, observerOptions)

    /**
     * State to track all elements currently in the viewport.
     * Useful for long sections which may cause the tracked element
     * to leave the view before the next element comes into viewport.
     * Or for short sections which may cause multiple tracked element
     * to be within the viewport.
     * @type HTMLElement
     */
    let activeElement
    /**
     * All elements in the viewport
     * @type HTMLElement[]
     */
    let inViewElements = []
    /**
     * Used to track elements which were not removed before they had long sections
     * @type HTMLElement
     */
    let skippedElement

    const asideLinksSelector = 'aside > div > nav > ul li a'
    /**
     * Get all links on the aside (TOC)
     */
    const asideLinks = document.querySelectorAll(asideLinksSelector)
    /**
     * The aside links hrefs
     * @type {string[]}
     */
    const asideLinksHrefs = []
    asideLinks.forEach((link) => asideLinksHrefs.push(link.getAttribute('href')))

    /**
     * The intersection observer callback
     * @param {IntersectionObserverEntry[]} entries List of IntersectionObserverEntry objects
     */
    function callback(entries) {
      entries.forEach((entry) => {
        const href = entry.target.getAttribute('href')
        /**
         * The targeted aside link element
         */
        const asideLink = document.querySelector(`${asideLinksSelector}[href="${href}"]`)
        /**
         * Get the parent element of the aside link
         * The active class will be applied to the element.
         */
        const asideLinkParent = asideLink?.parentElement

        if (entry.isIntersecting) {
          if (asideLinkParent) {
            activeElement = asideLinkParent
            activeElement.classList.add('active')
            inViewElements.push(asideLinkParent)

            // Whenever a new header enters the view, remove the `active` class from
            // all elements but the last element in the `inViewElements` array.
            if (inViewElements && inViewElements.length) {
              if (inViewElements.length > 1) {
                inViewElements.map((inViewElement, index, array) => {
                  if (index < array.length - 1) {
                    inViewElement.classList.remove('active')
                  }
                })
              }
            }
          }

          // Check if there is a `skippedElement`
          if (skippedElement) {
            skippedElement.classList.remove('active')
            skippedElement = null
          }
        } else {
          // Don't remove the active class until another link enters the view
          if (
            activeElement &&
            asideLinkParent &&
            activeElement.innerText === asideLinkParent.innerText
          ) {
            // Check if the tracked element leaving the viewport is the same
            // as the `latestElement` (last element in the `inViewElements` array).
            // That is, the next tracked element has not entered the viewport yet.
            // This is an header with a long section
            if (
              inViewElements &&
              inViewElements.length &&
              inViewElements[inViewElements.length - 1].innerText === activeElement.innerText
            ) {
              // Assign to skippedElement
              skippedElement = activeElement
              // Reset the inViewElements
              inViewElements.length = 0
            }
          }
        }
      })
    }

    /**
     * Get all in-page header links
     * These are the targets to be observed
     */
    const pageHeaderLinksSelector = 'main a[href^="#"]'
    const pageHeaderLinks = document.querySelectorAll(pageHeaderLinksSelector)
    if (pageHeaderLinks.length) {
      // Only observe in-page links which also are on the TOC.
      pageHeaderLinks.forEach((link) => {
        if (asideLinksHrefs.some((href) => href === link.getAttribute('href'))) {
          observer.observe(link)
        }
      })
    }
  },
})
