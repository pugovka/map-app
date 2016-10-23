import { moduleFor, test } from 'ember-qunit';

moduleFor('controller:map', 'Unit | Controller | map', {});

test('creates url', function(assert) {
  let mapController = this.subject();
  const coordinates = {
    lat: 43.15520306319495,
    lng: 131.91798090934756
  };
  const objectId = 108310688;
  let newUrl = mapController.createUrl(coordinates, objectId);
  
  assert.equal(
    newUrl, '/map/43.15520306319495/131.91798090934756/108310688', 'should create url correctly with id'
  );

  newUrl = mapController.createUrl(coordinates);
  assert.equal(
    newUrl, '/map/43.15520306319495/131.91798090934756', 'should create url correctly'
  );
});

test('sets url', function(assert) {
  let mapController = this.subject();
  const coordinates = {
    lat: 43.15459257561516,
    lng: 131.91977798938754
  };
  const objectId = 382440687;

  mapController.setUrl(coordinates, objectId);
  assert.equal(
    window.location.pathname, '/map/43.15459257561516/131.91977798938754/382440687', 'should set url correctly with id'
  );

  mapController.setUrl(coordinates);
  assert.equal(
    window.location.pathname, '/map/43.15459257561516/131.91977798938754', 'should set url correctly'
  );
});

test('set/unset current object id', function(assert) {
  let mapController = this.subject();

  mapController.setCurrentObjectId(382440687);
  assert.equal(mapController.get('currentObjectId'), 382440687, 'ids should be matched (number)');

  mapController.setCurrentObjectId(undefined);
  assert.equal(mapController.get('currentObjectId'), undefined, 'ids should be matched (undefined)');
});
