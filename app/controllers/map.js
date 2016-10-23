/* globals L */
import Ember from 'ember';

export default Ember.Controller.extend({
  // Set map center
  lat: 43.15440864546931,
  lng: 131.9187426567078,
  zoom: 17,
  currentObjectId: undefined,
  actions: {
    loadMap(map) {
      'use strict';

      const self = this;
      // Get leaflet map object
      self.set('map', map.target);
      const currentMapObject = self.get('map');
      const mapData = self.model;

      //Restore object id from model
      self.setCurrentObjectId(mapData.map_object_id);

      // Set current map view if coords passed by url
      if (!(Object.keys(mapData).length === 0 && mapData.constructor === Object)) {
        currentMapObject.setView(L.latLng(mapData.map_lat, mapData.map_lng));
      } else {
        self.setUrl(currentMapObject.getCenter());
      }

      currentMapObject.on('moveend', () => {
        if (!!self.currentObjectId) {
          self.setUrl(currentMapObject.getCenter(), self.currentObjectId);
        } else {
          self.setUrl(currentMapObject.getCenter());
        }
      });

      // Get map objects
      Ember.$.get({
        url: "/geo-objects",
        success(geoObjects) {
          L.geoJson(geoObjects.data[0].attributes.features, {
            style: () => {
              return {
                "color": "#008000"
              };
            },
            onEachFeature: (feature, layer) => {
              // Open sidebar if object id passed by url
              if (mapData.map_object_id && (parseInt(mapData.map_object_id) === parseInt(feature.properties.id))) {
                self.openSidebarWithObjectDescription(feature);
              }

              layer.on('click', () => {
                self.setCurrentObjectId(feature.properties.id);
                self.setUrl(currentMapObject.getCenter(), self.currentObjectId);
                self.openSidebarWithObjectDescription(feature);
              });
            }
          }).addTo(currentMapObject);
        },
        error() {
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

      // Delete object id from url
      this.setUrl(this.map.getCenter());
      // Unset object id
      this.setCurrentObjectId(undefined);
    }
  },

  setCurrentObjectId(value) {
    this.currentObjectId = value;
  },

  createUrl(coordinates, objectId) {
    'use strict';
    return (objectId) ?
      '/map/' + coordinates.lat + '/' + coordinates.lng + '/' + objectId :
      '/map/' + coordinates.lat + '/' + coordinates.lng;
  },

  // Set coords to an address bar
  setUrl(coordinates, objectId) {
    'use strict';
    const newUrl = this.createUrl(coordinates, objectId);
    if (newUrl !== window.location.pathname) {
      window.history.pushState('Set new coords', '', newUrl);
    }
  },

  openSidebarWithObjectDescription(geoObject) {
    'use strict';
    Ember.$('.map-object-description')
      .addClass('map-object-description--open')
      .find('.map-object-description__inner')
      .text(JSON.stringify(geoObject.properties));

    Ember.$('.map').addClass('map--scrolled');
  },
});
