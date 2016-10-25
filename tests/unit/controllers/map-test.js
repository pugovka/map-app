import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:map', 'Unit | Controller | map');

test('creates url', function(assert) {
  const mapController = this.subject();
  const coordinates = {
    lat: 43.15520306319495,
    lng: 131.91798090934756
  };
  const zoom = 15;
  const objectId = 108310688;
  let newUrl = mapController.createUrl(coordinates, zoom, objectId);
  
  assert.equal(
    newUrl, '/map/43.15520306319495/131.91798090934756/15/108310688', 'should create url correctly with id'
  );

  newUrl = mapController.createUrl(coordinates, zoom);
  assert.equal(
    newUrl, '/map/43.15520306319495/131.91798090934756/15', 'should create url correctly'
  );
});

test('sets url', function(assert) {
  const mapController = this.subject();
  const coordinates = {
    lat: 43.15459257561516,
    lng: 131.91977798938754
  };
  const zoom = 13;
  const objectId = 382440687;

  mapController.setUrl(coordinates, zoom, objectId);
  assert.equal(
    window.location.pathname, '/map/43.15459257561516/131.91977798938754/13/382440687', 'should set url correctly with id'
  );

  mapController.setUrl(coordinates, zoom);
  assert.equal(
    window.location.pathname, '/map/43.15459257561516/131.91977798938754/13', 'should set url correctly'
  );
});

test('set/unset current object id', function(assert) {
  const mapController = this.subject();

  mapController.setCurrentObjectId(382440687);
  assert.equal(mapController.get('currentObjectId'), 382440687, 'ids should be equal (number)');

  mapController.setCurrentObjectId(null);
  assert.equal(mapController.get('currentObjectId'), null, 'ids should be equal (null)');
});
