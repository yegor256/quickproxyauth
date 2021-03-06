[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/yegor256/quickproxyauth/master/LICENSE.txt)

This is a simple add-on for Firefox, which helps with automatic
proxy authorization in a Selenium/Geckodriver testing.

First, you specify the proxy for the webdriver (it's Ruby):

```ruby
require 'selenium-webdriver'
profile = Selenium::WebDriver::Firefox::Profile.new
profile.proxy = Selenium::WebDriver::Proxy.new(
  http: "#{host}:#{port}", ssl: "#{host}:#{port}"
)
opts = Selenium::WebDriver::Firefox::Options.new(profile: profile)
driver = Selenium::WebDriver.for(:firefox, options: opts)
```

Then, you add `.xpi` file, which you download [here](https://addons.mozilla.org/uk/firefox/addon/quickproxyauth/),
to the `extensions` directory of the profile you start Firefox with.
You can just `GET` it from
[this URL](https://addons.mozilla.org/firefox/downloads/file/3367452/quickproxyauth-0.0.13-fx.xpi).

If the add-on is invisible in Mozilla directory, you can just use this
file: [`quickproxyauth-0.0.13-fx.xpi`](https://github.com/yegor256/quickproxyauth/raw/master/quickproxyauth-0.0.13-fx.xpi)
(it is right in this repo).

You can't do it via Ruby [`add_extension`](https://www.rubydoc.info/gems/selenium-webdriver/3.142.3/Selenium/WebDriver/Firefox/Profile),
since it doesn't work with Firefox correctly.
You have to inject it via reflection:

```ruby
profile.instance_variable_set(:@extensions, { 'quickproxyauth': ext })
```

The object `ext` has to implement `write_to(dir)` method and
save the `{098674ef-b309-ef34-6749-98647725ee6b}.xpi`
file into the provided `dir`:

```ruby
ext = Class.new do
  def write_to(dir)
    FileUtils.mkdir_p(dir)
    f = File.join(dir, '{098674ef-b309-ef34-6749-98647725ee6b}.xpi')
    # Copy .xpi file into f
  end
end.new
```

Then, you have to inject a cookie into Firefox, before it starts. It's better
to implement this functionality also inside the `write_to()` method. Firefox
keeps its cookies in the `cookies.sqlite` [SQLite3](https://www.sqlite.org/index.html)
database in the profile directory. You
have to create this file before Firefox starts, create a new
[`moz_cookies`](http://kb.mozillazine.org/Cookies.sqlite) table there, and
then `INSERT` a single row into it with the `credentials` cookie in the
`quickproxyauth.com` domain:

```sql
CREATE TABLE moz_cookies (id INTEGER PRIMARY KEY,
  baseDomain TEXT, originAttributes TEXT NOT NULL DEFAULT '',
  name TEXT, value TEXT, host TEXT, path TEXT, expiry INTEGER,
  lastAccessed INTEGER, creationTime INTEGER, isSecure INTEGER,
  isHttpOnly INTEGER, inBrowserElement INTEGER DEFAULT 0,
  sameSite INTEGER DEFAULT 0);
INSERT INTO moz_cookies
  (baseDomain, name, value, host, path, expiry, lastAccessed, creationTime, isSecure, isHttpOnly)
  ('quickproxyauth.com', 'credentials', 'login:password', '.quickproxyauth.com', '/', 0, 0, 0, 0, 0);
```

Firefox, when the add-on starts, runs its
[`auth.js`](https://github.com/yegor256/quickproxyauth/blob/master/auth.js)
JavaScript automatically. The
script loads the cookie via
[`cookies.get()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/cookies/get)
and then uses
[`webRequest.onAuthRequired()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest/onAuthRequired)
of the [WebExtensions API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API)
to let the browser know what to do when the
proxy requires authorization.

Tested with [Selenium](https://github.com/SeleniumHQ/selenium)
[3.142.3](https://rubygems.org/gems/selenium-webdriver/versions/3.142.3),
Firefox 68.0.1, Geckodriver 0.24.0 on Mac OS and Ubuntu
in both headless and GUI modes.

## How to contribute

Install [npm](https://www.npmjs.com/) and build it:

```bash
$ npm install
$ npm run zip
```

`quickproxyauth.xpi` will be created in the root directory. Upload it
as a new version of the add-on to
[this page](https://addons.mozilla.org/en-US/developers/addon/quickproxyauth/versions)
of the Mozilla website. Then, you will have an ability to download
the `.xpi` file from there, after they review the new version and approve it.
It takes less than an hour.
