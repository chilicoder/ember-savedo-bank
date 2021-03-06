/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.
app.import('bower_components/currency.js/currency.js');
app.import('bower_components/moment/moment.js');
app.import('bower_components/ember-localstorage-adapter/localstorage_adapter.js');
app.import('bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.js');
app.import('bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.css');
//app.import('bower_components/ember-x-editable/dist/assets/ember-x-editable.js');
//app.import('bower_components/ember-x-editable/dist/assets/ember-x-editable.css');
//app.import('bower_components/ember-validations/packages/ember-validations/lib/main.js');


module.exports = app.toTree();
