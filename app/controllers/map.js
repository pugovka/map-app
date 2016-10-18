import Ember from 'ember';

export default Ember.Controller.extend({
  // Set map center
  lat: 43.13642778055136,
  lng: 131.92417144775393,
  zoom: 15,
  actions: {
    loadMap: function(map) {
      this.set('map', map.target);

      // Set location to user's location
      this.get('map').locate({setView: true});
    },

    showObjectDescription(e) {
      const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent('<p>' + e.latlng.lat + ' ' + e.latlng.lng + '</p>')
        .openOn(this.get('map'));
    }
  }
});
