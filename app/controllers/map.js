/* globals L */
import Ember from 'ember';

export default Ember.Controller.extend({
  // Set map center
  lat: 43.15440864546931,
  lng: 131.9187426567078,
  zoom: 17,
  actions: {
    loadMap: function(map) {
      'use strict';

      // Get leaflet map object
      this.set('map', map.target);
      const currentMapObject = this.get('map');
      const mapData = this.model;
      let currentObjectId = mapData.map_object_id;

      // Set current map view if coords passed by url
      if (!(Object.keys(mapData).length === 0 && mapData.constructor === Object)) {
        currentMapObject.setView(L.latLng(mapData.map_lat, mapData.map_lng));
      }

      currentMapObject.on('moveend', () => {
        if (currentObjectId) {
          setUrl(currentMapObject.getCenter(), currentObjectId);
        } else {
          setUrl(currentMapObject.getCenter());
        }
      });

      // Get map objects
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
              // Open sidebar if object id passed by url
              if (mapData.map_object_id && (parseInt(mapData.map_object_id) === parseInt(feature.properties.id))) {
                openSidebarWithObjectDescription(feature);
              }

              layer.bindPopup(
                feature.properties.tags.name ||
                feature.properties.tags['addr:street'] + ' ' + feature.properties.tags['addr:housenumber']
               );

              layer.on('click', () => {
                currentObjectId = feature.properties.id;
                setUrl(currentMapObject.getCenter(), currentObjectId);
                openSidebarWithObjectDescription(feature);
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
      'use strict';

      const $mapObjectDescription = Ember.$('.map-object-description');
      const $mapContainer = Ember.$('.map');

      // Hide sidebar and clear text data
      if ($mapObjectDescription.hasClass('map-object-description--open')) {
        $mapObjectDescription
          .removeClass('map-object-description--open')
          .find('.map-object-description__inner')
          .text('');
      }

      // Return map container width
      if ($mapContainer.hasClass('map--scrolled')) {
        $mapContainer.removeClass('map--scrolled');
      }

      setUrl(this.map.getCenter());
    }
  }
});


const createUrl = (coordinates, objectId) => {
  'use strict';
  return (objectId) ?
    '/map/' + coordinates.lat + '/' + coordinates.lng + '/' + objectId :
    '/map/' + coordinates.lat + '/' + coordinates.lng;
};

// Set coords to an address bar
const setUrl = (coordinates, objectId) => {
  'use strict';

  const newUrl = createUrl(coordinates, objectId);
  if (newUrl !== window.location.pathname) {
    window.history.pushState('Set new coords', '', newUrl);
  }
};

const openSidebarWithObjectDescription = (geoObject) => {
  'use strict';
  Ember.$('.map-object-description')
    .addClass('map-object-description--open')
    .find('.map-object-description__inner')
    .text(JSON.stringify(geoObject.properties));

  Ember.$('.map').addClass('map--scrolled');
};
