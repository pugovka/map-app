import { test } from 'qunit';
import moduleForAcceptance from 'map-app/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | map');

test('should redirect to map route', (assert) => {
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/map', 'should redirect automatically');
  });
});

test('should display map', function(assert) {

  visit('/');

  andThen(function() {
    const coordinates = {
      lat: 43.15459257561516,
      lng: 131.91977798938754
    };
    assert.equal(mapExists('leaflet-container', coordinates), true, 'map should be created');
  });
});
