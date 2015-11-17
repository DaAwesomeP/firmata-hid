/* firmata.js by DaAwesomeP
 * Originally created 11/16/2015
 * This file provides the Firmata functions for firmata-hid.
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
  
  var async = require('async');
  var _ = require('lodash');
  var Board = require('firmata');
  var board = new Board(config.port);
  
  var exports = {};
  
  exports.states = [];
  exports.init = function(options, callback) {
    board.on('ready', function() {
      if (!config.quiet) {
        console.log('Firmata device is ready');
      } 
      if (options.hasOwnProperty('inputs')) {
        if (options.inputs.hasOwnProperty('digital')) {
          async.each(options.inputs.digital, function(obj, callback) {
            if (config.verbose && !config.quiet) {
              console.log('assinging pin ' + obj.pin + ' as a digital input');
            }
            board.pinMode(obj.pin, board.MODES.INPUT);
            board.digitalRead(obj.pin, function(value) {
              exports.states[obj.pin] = value;
              exports.sendPin(obj, value);
            });
            callback();
          }, function(err) {
            // Currently no support for other types of input, move along
            callback(err);
          });
        }
      }
    });
  };
  exports.sendPin = function(obj, value) {
    if (config.verbose && !config.quiet) {
      console.log('digital input %d: %d', obj.pin, value);                        // Log change to console
    }
    async.each(obj.assign, function(assign, callback) {                       // For each assignment
      if (assign.type === 'keyboard') {                                       //   If assignment is keyboard
        if (value === 1 && assign.high.send !== false) {                      //     If the value is high and mapping is enabled
         if (assign.low.fire === "continuous") {                              //       Turn off the low key
            config.keyToggle(assign.low.send, 'up');
          }
          if (assign.high.send !== false) {
            if (assign.high.fire === 'continuous') {                            //       If the mapping is continuous
              config.keyToggle(assign.high.send, 'down');
              callback();
            }
            else if (assign.high.fire === 'continuousHack') {                       //       If the mapping is continuousHack
              async.whilst(function () {
                if (exports.states[obj.pin] === 1) { return true; }
                else { return false; }
              },
              function (callback) {
                config.keyTap(assign.high.send);
                _.delay(callback, obj.debounce);
              },
              function (err) {
                // Ha! Missed the callback!
              });
              callback();
            }
            else if (assign.high.fire === 'once') {                             //       If the mapping is single-fire
              var fired = false;
              if (!fired) {
                config.keyTap(assign.high.send);
                fired = true;
                callback();
              }
            }
            else {
              // Unknown, move along
              callback();
            }
          }
          else {
            // Disabled, move along
            callback();
          }
        }
        else if (value === 0) {                  //     If the value is low and mapping is enabled
          if (assign.high.fire === "continuous") {                            //       Turn off the high key
            config.keyToggle(assign.high.send, 'up');
          }
          if (assign.low.send !== false) {
            if (assign.low.fire === 'continuous') {                             //       If the mapping is continuous
              config.keyToggle(assign.low.send, 'down');
              callback();
            }
            else if (assign.high.fire === 'continuousHack') {                       //       If the mapping is continuousHack
              async.whilst(function () {
                if (exports.states[obj.pin] === 0) { return true; }
                else { return false; }
              },
              function (callback) {
                config.keyTap(assign.low.send);
                _.delay(callback(), obj.debounce);
              },
              function (err) {
                // Ha! Missed the callback!
              });
              callback();
            }
            else if (assign.low.fire === 'once') {                              //       If the mapping is single-fire
              var fired = false;
              if (!fired) {
                config.keyTap(assign.low.send);
                fired = true;
                callback();
              }
            }
            else {
              // Unknown, move along
              callback();
            }
          }
          else {
            // Disabled, move along
            callback();
          }
        }
        else {
          // Unknown, move along
          callback();
        }
      }
    }, function(err) {
      if (err) throw(err);
    });
  };
  
  return exports;
};
