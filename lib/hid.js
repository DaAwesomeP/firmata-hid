/* firmata.js by DaAwesomeP
 * Originally created 11/16/2015
 * This file provides the Human Interface Device (HID) functions for firmata-hid.
 * https://github.com/DaAwesomeP/firmata-hid
 * 
 * Copyright 2015-present DaAwesomeP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function(config) {
  
  var robot = require("robotjs");
  
  var exports = {};
  
  exports.keyToggle = function(key, state) {
    if (!config.quiet && config.verbose) {
      console.log('toggling key "' + key + '" to ' + state);
    }
    if (!config.xdtool) {
      robot.keyToggle(key, state);
    }
    else {
      // Xdtool not currently supported
    }
  };
  exports.keyTap = function(key) {
    if (!config.quiet && config.verbose) {
      console.log('tapping key "' + key + '"');
    }
    if (!config.xdtool) {
      robot.keyTap(key);
      
    }
    else {
      // Xdtool not currently supported
    }
  };
  
  return exports;
};
