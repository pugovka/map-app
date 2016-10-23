/* globals L */
import Ember from 'ember';

export default Ember.Test.registerHelper('mapExists', function(app, container) {
  const map = L.map(container.toString());
  if (!!map) {
    return true;
  }
  return false;
});
