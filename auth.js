browser.webRequest.onAuthRequired.addListener(
  function (details) {
    return {
      authCredentials: {
        username: "QEtcUh",
        password: "37gnqu"
      }
    };
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
