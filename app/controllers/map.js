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
      const defaultStyle = { color: '#f6f19b' };
      const hoverStyle = { color: '#008000' };

      //Restore object id from model
      self.setCurrentObjectId(mapData.map_object_id);

      // Set current map view if coords passed by url
      if (self.notEmpty(mapData)) {
        currentMapObject.setView(L.latLng(mapData.map_lat, mapData.map_lng), mapData.map_zoom, {
          noMoveStart: true
        });
      } else {
        self.setUrl(currentMapObject.getCenter(), currentMapObject.getZoom());
      }

      currentMapObject.on('moveend', () => {
        if (!!self.currentObjectId) {
          self.setUrl(currentMapObject.getCenter(), currentMapObject.getZoom(), self.currentObjectId);
        } else {
          self.setUrl(currentMapObject.getCenter(), currentMapObject.getZoom());
        }
      });

      // Get map objects
      Ember.$.get({
        url: "/geo-objects",

        success(geoObjects) {
          let prevClickedLayerId;
          let layerFromModel;

          const geoJson = L.geoJson(geoObjects.data[0].attributes.features, {
            nonBubblingEvents: ['click', 'mouseover', 'mouseout'],
            style() {
              return defaultStyle;
            },

            onEachFeature(feature, layer) {
              // Open sidebar if object id passed by url
              if (mapData.map_object_id && (parseInt(mapData.map_object_id) === parseInt(feature.properties.id))) {
                self.openSidebarWithObjectDescription(feature);
                layer.setStyle({ 
                  color: '#ea7912',
                  weight: 3
                });
                layer.checked = true;
                prevClickedLayerId = 'from model';
                layerFromModel = layer;
              }

              layer.on('click', function() {
                self.setCurrentObjectId(feature.properties.id);
                self.setUrl(currentMapObject.getCenter(), currentMapObject.getZoom(), self.currentObjectId);
                self.openSidebarWithObjectDescription(feature);

                if (!layer.checked) {
                  if (prevClickedLayerId) {
                    if (prevClickedLayerId === 'from model') {
                      geoJson.resetStyle(layerFromModel);
                    } else {
                      // Unset prev checked object style
                      currentMapObject._layers[prevClickedLayerId].setStyle(defaultStyle);
                      currentMapObject._layers[prevClickedLayerId].checked = false;
                    }
                  }

                  layer.setStyle({ 
                    color: '#ea7912',
                    weight: 5
                  });
                  layer.checked = true;
                  prevClickedLayerId = this._leaflet_id;
                } else {
                  layer.setStyle(hoverStyle);
                  layer.checked = false;
                }
              })
                .on('mouseover', function() {
                  if (!layer.checked) {
                    layer.setStyle(hoverStyle);
                  } else {
                    layer.setStyle({ weight: 5 });
                  }
                })
                .on('mouseout', function() {
                  if (!layer.checked) {
                    layer.setStyle(defaultStyle);
                  } else {
                    layer.setStyle({ weight: 3 });
                  }
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
      this.setUrl(this.map.getCenter(), this.map.getZoom());
      // Unset object id
      this.setCurrentObjectId(undefined);
    }
  },

  setCurrentObjectId(value) {
    this.currentObjectId = value;
  },

  createUrl(coordinates, zoom, objectId) {
    'use strict';
    return (objectId) ?
      '/map/' + coordinates.lat + '/' + coordinates.lng + '/' + zoom + '/' + objectId :
      '/map/' + coordinates.lat + '/' + coordinates.lng + '/' + zoom;
  },

  // Set coords to an address bar
  setUrl(coordinates, zoom, objectId) {
    'use strict';
    const newUrl = this.createUrl(coordinates, zoom, objectId);
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

  notEmpty(object) {
    if (Object.keys(object).length === 0 && object.constructor === Object) {
      return false;
    }
    return true;
  }

});
