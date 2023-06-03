(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(["./client"], function(CoCreatePlaid) {
        	return factory(CoCreatePlaid)
        });
    } else if (typeof module === 'object' && module.exports) {
      const CoCreatePlaid = require("./server.js")
      module.exports = factory(CoCreatePlaid);
    } else {
        root.returnExports = factory(root["./client.js"]);
  }
}(typeof self !== 'undefined' ? self : this, function (CoCreatePlaid) {
  return CoCreatePlaid;
}));