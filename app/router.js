import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('map');
  // Route with coords
  this.route('map', { path: '/map/:lat/:lng/' });
  // Route with coords and object id
  this.route('map', { path: '/map/:lat/:lng/:id' });
});

export default Router;
