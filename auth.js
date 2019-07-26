browser.cookies.get({ url: 'http://quickproxyauth.com', name: 'credentials'}).then(function (cookie) {
  var parts = cookie.value.split(':');
  browser.webRequest.onAuthRequired.addListener(
    function (details) {
      return {
        authCredentials: {
          username: parts[0],
          password: parts[1]
        }
      };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
  );
});
