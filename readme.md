# Stack Fanatic

[![npm package version](https://img.shields.io/npm/v/stack-fanatic.svg?style=flat-square)](https://www.npmjs.com/package/stack-fanatic)
[![Travis build status](https://img.shields.io/travis/kodie/stack-fanatic.svg?style=flat-square)](https://travis-ci.org/kodie/stack-fanatic)
[![npm package downloads](https://img.shields.io/npm/dt/stack-fanatic.svg?style=flat-square)](https://www.npmjs.com/package/stack-fanatic)
[![code style](https://img.shields.io/badge/code_style-standard-yellow.svg?style=flat-square)](https://github.com/standard/standard)
[![license](https://img.shields.io/github/license/kodie/stack-fanatic.svg?style=flat-square)](license.md)

A node module that uses Google's [Puppeteer](https://pptr.dev/) library to visit your [Stack Overflow](https://stackoverflow.com/) profile and check the progress of the badge you are currently tracking.

## Installation

```shell
npm install stack-fanatic
```

## Usage

### Options

The following options can be passed to any functions (however none of them are required):

* **debug** - A boolean stating wether or not debugging information should be displayed in the console (Default: `false`)

* **loginEmail** - A string containing the email address asssociated with the StackOverflow account that you would like to log in to.

* **loginPassword** - A string containing the password for the StackOverflow account that you would like to log in to.

* **puppeteerOpts** - An object containing any options you wish to pass to the [puppeteer.launch()](https://pptr.dev/#?product=Puppeteer&version=v1.18.1&show=api-puppeteerlaunchoptions) function. (Sets the user agent to Google Chrome and the user data directory to `./userData` by default)

* **site** - A string containing the URL for the Stack Exchange site that you would like to pull badge info from. Should include the protocol at the beginning and no trailing slash. (Default: `https://stackoverflow.com`)

### check(options)

Visits your StackOverflow profile page and returns a promise that resolves with information about your tracked badge.

*Note: The `login` function will automatically be ran if `loginEmail` and `loginPassword` are passed as options and you are not currently logged in.*

```js
const stackFanatic = require('stack-fanatic')

stackFanatic
  .check({
    loginEmail: 'example@email.com',
    loginPassword: 'password1234',
    site: 'https://stackoverflow.com'
  })
  .then(res => {
    console.log('Badge Name:', res.badge)
    console.log('Badge Type:', res.type)
    console.log('Current Progress:', res.now)
    console.log('Percent Completed:', res.percent)
  })
  .catch(err => {
    console.log(err.message)
  })
```

### Example Response
```js
{
  badge: 'Fanatic',
  max: 100,
  min: 0,
  now: 20,
  percent: 20,
  profile: 'https://stackoverflow.com/users/5463842/kodie-grantham',
  type: 'Gold'
}
```

### login(options)

Logs into a StackOverflow account and returns a promise that resolves with `true` or `false` depending on if the login was successful or not.

*Note: After you are logged in, your session info will be saved in `./userData` so that you can run the `check` function without having to log in again.*

```js
const stackFanatic = require('stack-fanatic')

stackFanatic
  .login({
    loginEmail: 'example@email.com',
    loginPassword: 'password1234'
  })
  .then(loggedIn => {
    if (loggedIn) {
      console.log('Yay! You are logged in! :D')
    } else {
      console.log('Aw dang! You are not logged in. :(')
    }
  })
  .catch(err => {
    console.log(err.message)
  })
```

## Tips/Tricks

### Check badge progress without logging in

Just set `site` to the URL of your Stack Overflow profile and make sure that you have `?tab=topactivity` at the end of it.

While you're at it, set Puppeteer's `userDataDir` option to `false` so that no session data or cache is saved.

```js
stackFanatic
  .check({
    site: 'https://stackoverflow.com/users/5463842/kodie-grantham?tab=topactivity',
    puppeteerOpts: {
      userDataDir: false
    }
  })
```

## Related

* [stack-fanatic-cli](https://github.com/kodie/stack-fanatic-cli) - The CLI tool for this module

## License
MIT. See the [LICENSE file](LICENSE.md) for more info.
