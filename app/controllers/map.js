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
      const defaultStyle = { 
        color: '#f6f19b',
        weight: 3 
      };
      const hoverStyle = { color: '#008000' };
      const clickedStyle = { color: '#ea7912' };
      let geoJson = L.geoJson();
      let prevClickedLayerId;

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
      })
        .on('click', () => {
          self.closeObjectDescription(currentMapObject, geoJson, defaultStyle, prevClickedLayerId);
        });

      // Get map objects
      Ember.$.get({
        url: "/geo-objects",

        success(geoObjects) {

          geoJson = L.geoJson(geoObjects.data[0].attributes.features, {
            nonBubblingEvents: ['click', 'mouseover', 'mouseout'],
            style() {
              return defaultStyle;
            },

            onEachFeature(feature, layer) {
              layer.checked = false;

              // Open sidebar if object id passed by url
              if (mapData.map_object_id && (parseInt(mapData.map_object_id) === parseInt(feature.properties.id))) {
                self.openObjectDescription(feature);
                layer.setStyle(clickedStyle);
                // Set labels to checked
                layer.checked = true;
                prevClickedLayerId = geoJson.getLayerId(layer);
              }

              layer.on('click', function() {
                self.setCurrentObjectId(feature.properties.id);
                self.setUrl(currentMapObject.getCenter(), currentMapObject.getZoom(), self.currentObjectId);
                self.openObjectDescription(feature);

                if (!layer.checked) {
                  if (prevClickedLayerId) {
                    geoJson.getLayer(prevClickedLayerId).setStyle(defaultStyle);
                    geoJson.getLayer(prevClickedLayerId).checked = false;
                  }

                  layer.setStyle(clickedStyle);
                  layer.checked = true;
                  prevClickedLayerId = geoJson.getLayerId(layer);
                } else {
                  if (prevClickedLayerId) {
                    // Unset prev checked object style
                    geoJson.getLayer(prevClickedLayerId).setStyle(defaultStyle);
                    geoJson.getLayer(prevClickedLayerId).checked = false;
                  }
                  self.closeObjectDescription(currentMapObject, geoJson, defaultStyle);
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
  },

  closeObjectDescription(map, geoJson, defaultStyle, prevObjectId) {
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

    // Restore map container width
    if ($mapContainer.hasClass('map--scrolled')) {
      $mapContainer.removeClass('map--scrolled');
    }

    // Delete object id from url
    this.setUrl(map.getCenter(), map.getZoom());
    // Unset object id
    this.setCurrentObjectId(undefined);
    geoJson.setStyle(defaultStyle);
    if (prevObjectId) {
      geoJson.getLayer(prevObjectId).checked = false;
    }
  },

  setCurrentObjectId(value) {
    'use strict';
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

  openObjectDescription(geoObject) {
    'use strict';
    const convertedObject = this.convertObjectDescription(geoObject.properties.tags);
    let str = '';

    for (let key in convertedObject) {
      str +=
        '<div class="map-object-description__field">' + key + '</div>' +
        '<div class="map-object-description__field">' + convertedObject[key] + '</div>';
    }

    if (str === '') {
      str = 'No description is provided';
    }

    Ember.$('.map-object-description')
      .addClass('map-object-description--open')
      .find('.map-object-description__inner')
      .html(str);

    Ember.$('.map').addClass('map--scrolled');
  },

  notEmpty(object) {
    'use strict';
    if (Object.keys(object).length === 0 && object.constructor === Object) {
      return false;
    }
    return true;
  },

  convertObjectDescription(objectTags) {
    const convertedObject = {};
    const dictionary = {
      "id": "id",
      "name": "name",
      "addr:city": "city",
      "addr:street": "street",
      "addr:housenumber": "house number",
      "addr:postcode": "postcode"
    };

    for (let key in objectTags) {
      if (dictionary[key]) {
        convertedObject[dictionary[key]] = objectTags[key];
      }
    }
    return convertedObject;
  }

});
