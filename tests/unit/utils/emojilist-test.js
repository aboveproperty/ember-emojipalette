import emojilist from 'dummy/utils/emojilist';
import { module, test } from 'qunit';

module('Unit | Utility | emojilist', function(/* hooks */) {

  // Replace this with your real tests.
  test('it provides emojilist value', function(assert) {
    let result = emojilist;
    assert.equal(result.emojilist.people[0], '😀');
  });
});
