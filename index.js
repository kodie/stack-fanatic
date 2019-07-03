'use strict'

const merge = require('deepmerge')
const puppeteer = require('puppeteer')
const url = require('url')

const defaultOpts = {
  debug: false,
  loginEmail: null,
  loginPassword: null,
  puppeteerOpts: {
    args: [
      '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36'
    ],
    userDataDir: './userData'
  },
  site: 'https://stackoverflow.com'
}

const getPath = theUrl => {
  const parts = url.parse(theUrl, true)
  return parts.path
}

module.exports = {
  check: async opts => {
    this.opts = merge(defaultOpts, opts)

    const browser = await puppeteer.launch(this.opts.puppeteerOpts)

    try {
      const page = await browser.newPage()

      await page.goto(this.opts.site)

      if (this.opts.debug) console.log('Loaded:', page.url())

      let path = getPath(page.url())

      if (!path.startsWith('/users')) {
        let profileLink = await page.$('a.my-profile')

        if (!profileLink) {
          if (this.opts.debug) console.log('No profile link found, probably need to log in')

          if (this.opts.loginEmail && this.opts.loginPassword) {
            browser.close()

            let login = await module.exports.login(opts)

            if (login) {
              return await module.exports.check(opts)
            } else {
              throw new Error('Something unexpected happened')
            }
          } else {
            throw new Error('Not logged in')
          }
        }

        await profileLink.click()
        await page.waitForNavigation()

        if (this.opts.debug) console.log('Loaded:', page.url())

        path = getPath(page.url())
      }

      if (path.startsWith('/users')) {
        const badge = await page.$eval('#badge-card-next .s-badge--label', el => el.textContent)

        const type = await page.$eval('#badge-card-next .s-badge--image', el => {
          let type = Object.values(el.classList).find(c => c.startsWith('badge'))

          switch (type[type.length - 1]) {
            case '1':
              return 'Gold'
            case '2':
              return 'Silver'
            case '3':
              return 'Bronze'
          }
        })

        const progress = await page.$eval('#badge-card-next .s-progress--bar', el => Object({
          max: el.getAttribute('aria-valuemax'),
          min: el.getAttribute('aria-valuemin'),
          now: el.getAttribute('aria-valuenow')
        }))

        let profile = page.url()

        browser.close()

        const percent = ((progress.now / progress.max) * 100)

        return {
          badge: String(badge),
          max: Number(progress.max),
          min: Number(progress.min),
          now: Number(progress.now),
          percent: Number(percent),
          profile: String(profile),
          type: String(type)
        }
      } else {
        if (this.opts.debug) console.log('Was not sent to profile page, probably need to log in')

        if (this.opts.loginEmail && this.opts.loginPassword) {
          browser.close()

          let login = await module.exports.login(opts)

          if (login) return await module.exports.check(opts)
        } else {
          throw new Error('Not logged in')
        }
      }
    } catch (err) {
      browser.close()
      throw err
    }
  },

  login: async opts => {
    this.opts = merge(defaultOpts, opts)

    const browser = await puppeteer.launch(this.opts.puppeteerOpts)

    try {
      const page = await browser.newPage()

      await page.goto(`${this.opts.site}/users/login`)

      if (this.opts.debug) console.log('Loaded:', page.url())

      let path = getPath(page.url())

      if (path === '/') {
        if (this.opts.debug) console.log('Already logged in')
        browser.close()
        return true
      }

      if (!this.opts.loginEmail || !this.opts.loginPassword) {
        throw new Error('loginEmail and loginPassword are required')
      }

      await page.type('#email', this.opts.loginEmail)
      await page.type('#password', this.opts.loginPassword)
      await page.click('#submit-button')
      await page.waitForNavigation()

      if (this.opts.debug) console.log('Loaded:', page.url())

      path = getPath(page.url())

      if (path === '/') {
        if (this.opts.debug) console.log('Login successful!')

        browser.close()
        return true
      } else if (path === '/users/login') {
        const message = await page.$eval('.has-error .js-error-message', el => el.textContent)
        throw new Error(String(message).trim())
      } else if (path === '/nocaptcha') {
        throw new Error('Caught by the captcha, try again later')
      } else {
        throw new Error('Something unexpected happened. Was redirected to:', page.url())
      }
    } catch (err) {
      browser.close()
      throw err
    }
  }
}
