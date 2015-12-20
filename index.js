var self = require('sdk/self');
var pageMod = require('sdk/page-mod');

var pinyinStr = self.data.load('pinyin.json');

pageMod.PageMod({
  include: "*",
  contentScriptFile: [
    self.data.url('xregexp-all.js'),
    self.data.url('h2p-converter.js'),
    self.data.url('filter.js'),
    self.data.url('filter-regexp.js'),
    self.data.url('modify-page.js')
  ],
  onAttach: function (worker) {
    worker.port.emit("pinyin", pinyinStr);
  }
});
