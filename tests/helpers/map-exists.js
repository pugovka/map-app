/* globals L */
import Ember from 'ember';

export default Ember.Test.registerHelper('mapExists', function(app, container, coordinates) {
  const htmlContainer = document.createElement('div');
  htmlContainer.className = container.toString();
  const map = L.map(htmlContainer);
  map.setView(L.latLng(coordinates.lat, coordinates.lng));

  if (map) {
    return true;
  }
  return false;
});
