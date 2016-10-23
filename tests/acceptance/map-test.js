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
    assert.equal(mapExists('map'), true, 'map should be created');
  });
});
