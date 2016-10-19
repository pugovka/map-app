import Ember from 'ember';

export default Ember.Controller.extend({
  // Set map center
  lat: 43.15440864546931,
  lng: 131.9187426567078,
  zoom: 17,
  actions: {
    loadMap: function(map) {
      this.set('map', map.target);

      const currentMapObject = this.get('map');

      $.ajax({
        type: 'GET',
        url: "/api/geo-objects",
        success: function(geoObjects) {
          L.geoJson(geoObjects.data[0].attributes.features, {
            style: () => {
              return {
                "color": "#008000"
              }
            },
            onEachFeature: (feature, layer) => {
             layer.bindPopup(feature.properties.tags.name || feature.properties.tags['addr:street'] || 'no name');
            }
          }).addTo(currentMapObject);
        }
      }).error(function() {
        throw new Error('Invalid geo data');
      });
    },

    showObjectDescription(e) {
      const popup = L.popup()
        .setLatLng(e.latlng)
        .setContent('<p>' + e.latlng.lat + ' ' + e.latlng.lng + '</p>')
        .openOn(this.get('map'));
    }
  }
});
