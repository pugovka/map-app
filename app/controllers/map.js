/* globals L */
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
      const mapData = this.model;

      // Set current map view if coords passed by url
      if (!(Object.keys(mapData).length === 0 && mapData.constructor === Object)) {
        currentMapObject.setView(L.latLng(mapData.lat, mapData.lng));
      }

      currentMapObject.on('moveend', () => {
        const mapCurrentCenter = currentMapObject.getCenter();
        const newUrl = (mapData.objectId) ?
          '/map/' + mapCurrentCenter.lat + '/' + mapCurrentCenter.lng + '/' + mapData.objectId:
          '/map/' + mapCurrentCenter.lat + '/' + mapCurrentCenter.lng;

        if (newUrl !== window.location.pathname) {
          // Set coords to an address bar
          window.history.pushState('Set new coords', '', newUrl);
        }
      });

      Ember.$.get({
        url: "/geo-objects",
        success: function(geoObjects) {
          L.geoJson(geoObjects.data[0].attributes.features, {
            style: () => {
              return {
                "color": "#008000"
              };
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
                Ember.$('.map-object-description')
                  .addClass('map-object-description--open')
                  .find('.map-object-description__inner')
                  .text(JSON.stringify(feature.properties));
                Ember.$('.map').addClass('map--scrolled');
              });
            }
          }).addTo(currentMapObject);
        },
        error: function() {
          throw new Error('Invalid geo data');
        }
      });
    },

    clickOnEmptyArea() {
      const $mapObjectDescription = Ember.$('.map-object-description');
      const $map = Ember.$('.map');

      // Hide sidebar and clear text data
      if ($mapObjectDescription.hasClass('map-object-description--open')) {
        $mapObjectDescription
          .removeClass('map-object-description--open')
          .find('.map-object-description__inner')
          .text('');
      }

      if ($map.hasClass('map--scrolled')) {
        $map.removeClass('map--scrolled');
      }
    }
  }
});
