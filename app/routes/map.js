import Ember from 'ember';

export default Ember.Route.extend({
  model(params) {
    // Pass coords to the map controller
    return params;
  }
});
