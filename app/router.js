import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('payees', function() {
    this.resource('payee', function() {});
    this.route('new');
  });
  this.resource('payments', function() {
    this.route('new');
  });
});

export default Router;
