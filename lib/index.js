#!/usr/bin/env node
/* index.js by DaAwesomeP
 * Originally created 11/16/2015
 * This is the lib folder index file for firmata-hid.
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

var program = require('commander');
var chalk = require('chalk');
var package = require('../package.json');

var filePath;
var port;

// Grab the CLI options
program
  .version(package.version)
  .usage('[options] <settings file> <serial port>')
  .arguments('<file> [port]')
  .option('-q, --quiet', 'Run quitely (takes precedence over the verbose option)')
  .option('-t, --test', 'Test the options file and quit')
  .option('-v, --verbose', 'Log all events to the console (unless the quiet option is specified)')
  .option('-V, --version', 'Print the version and quit')
  .option('-x, --xdtool', 'Use xdtool instead of robotjs (currently not supported)')
  .action(function (cmdFile, cmdPort) {
       filePath = cmdFile;
       port = cmdPort;
  })
  .parse(process.argv);

// Show banner
if (!program.quiet) {
  console.log(chalk.gray.bgWhite.bold('                                            '));
  console.log(chalk.gray.bgWhite.bold(' -------------- ') + chalk.red.bgWhite.bold('firmata-hid') + chalk.gray.bgWhite.bold(' --------------- '));
  console.log(chalk.gray.bgWhite.bold(' |') + chalk.blue.bgWhite.bold('Mapping Firmata events to HID since 2015') + chalk.gray.bgWhite.bold('| '));
  console.log(chalk.gray.bgWhite.bold(' ------------------------------------------ '));
  console.log(chalk.gray.bgWhite.bold('                                            '));
  console.log('');
  console.log(chalk.green.bold('Using config:      ') + filePath);
  console.log(chalk.green.bold('Using serial port: ') + port);
}

var config = {
  port: port,
  quiet: program.quiet,
  verbose: program.verbose,
  xdtool: program.xdtool
};

// Init settings file
if (typeof filePath === 'undefined') {
   console.error('No settings file provided. Run with --help or check the README for help.');
   process.exit(1);
}
var options = require(process.cwd() + '/' + filePath);

// Init serial port
if (typeof port === 'undefined') {
   console.error('No serial port provided. Run with --help or check the README for help.');
   process.exit(1);
}

// Init HID
var hid = require('./hid')(config);
config.keyToggle = hid.keyToggle;
config.keyTap = hid.keyTap;

// Init firmata
var firmata = require('./firmata')(config);
firmata.init(options, function(err) {
  if (err) throw(err);
  if (!config.quiet) {
    console.log('Pin mappings intialized');
  } 
});
