import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  // Route with coords and object id
  this.route('map', { path: '/map/:map_lat/:map_lng/:map_zoom/:map_object_id' });
  // Route with coords
  this.route('map', { path: '/map/:map_lat/:map_lng/:map_zoom' });
  this.route('map');
});

export default Router;
