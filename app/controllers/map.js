import Ember from 'ember';

export default Ember.Controller.extend({
  // Set map center
  lat: 43.15440864546931,
  lng: 131.9187426567078,
  zoom: 17,
  actions: {
    loadMap: function(map) {
      // Get leaflet map object
      this.set('map', map.target);
      const currentMapObject = this.get('map');
      const currentCoords = this.model;

      // Set current map view if coords passed by url
      if (!(Object.keys(currentCoords).length === 0 && currentCoords.constructor === Object)) {
        currentMapObject.setView(L.latLng(currentCoords.lat, currentCoords.lng));
      }

      currentMapObject.on('moveend', (e) => {
        const mapCurrentCenter = currentMapObject.getCenter();

        // Set coords to an address bar
        window.history.pushState(
          'Set new coords', '', '/map/' + mapCurrentCenter.lat + '/' + mapCurrentCenter.lng
        );
      });

      $.ajax({
        type: 'GET',
        url: "/geo-objects",
        success: function(geoObjects) {
          L.geoJson(geoObjects.data[0].attributes.features, {
            style: () => {
              return {
                "color": "#008000"
              }
            },
            onEachFeature: (feature, layer) => {
              layer.bindPopup(
                feature.properties.tags.name ||
                feature.properties.tags['addr:street'] + ' ' + feature.properties.tags['addr:housenumber']
               );
              layer.on('click', () => {
                const mapCurrentCenter = currentMapObject.getCenter();

                // Set the id to an address bar
                window.history.pushState(
                  'Set object id',
                  '',
                  '/map/' + mapCurrentCenter.lat + '/' + mapCurrentCenter.lng + '/' + feature.properties.id
                );

                // Show object description in a sidebar
                $('.map-object-description')
                  .text(JSON.stringify(feature.properties))
                  .addClass('map-object-description--open');
                $('.map').addClass('map--scrolled');
              });
            }
          }).addTo(currentMapObject);
        }
      }).error(function() {
        throw new Error('Invalid geo data');
      });
    },

    clickOnEmptyArea() {
      const $mapObjectDescription = $('.map-object-description');
      const $map = $('.map');

      // Hide sidebar and clear text data
      if ($mapObjectDescription.hasClass('map-object-description--open')) {
        $mapObjectDescription
          .text('')
          .removeClass('map-object-description--open');
      }

      if ($map.hasClass('map--scrolled')) {
        $map.removeClass('map--scrolled');
      }
    }
  }
});
