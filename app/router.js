import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('payees', function() {
    this.route('new');
    this.resource('payees.payee',{path: '/:payee_id'});
  });
  this.resource('payments', function() {
    this.route('new');
  });
});

export default Router;