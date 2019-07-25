var prefs = Components.classes['@mozilla.org/preferences-service;1']
  .getService(Components.interfaces.nsIPrefBranch);
var host = pref.getCharPref('extensions.quickproxyauth.host');
var port = pref.getCharPref('extensions.quickproxyauth.port');
var login = pref.getCharPref('extensions.quickproxyauth.login');
var password = pref.getCharPref('extensions.quickproxyauth.password');
var Ctor = new Components.Constructor(
  '@mozilla.org/login-manager/loginInfo;1',
  Components.interfaces.nsILoginInfo,
  'init'
);
var info = new Ctor(
  host, null, 'moz-proxy://' + host + ':' + port,
  login, password, '', ''
);
var manager = Components.classes['@mozilla.org/login-manager;1']
  .getService(Components.interfaces.nsILoginManager);
manager.addLogin(info);
