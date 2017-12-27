'use strict';

import anime from 'animejs';

(function(root, factory) {
  if (root === window || root === global) {
    root.cadv = factory();
    console.log('Browser / Node');
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
    console.log('ES Module');
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
    console.log('Anonymous Module');
  } else {
    console.log('Not suppose to happen...');
  }
}((window || global || module || {}), () => {

  const x = 0;

  return {
    x
  };

}));
