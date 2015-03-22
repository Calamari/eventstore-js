
var Distributor = require('../../event_distributors/simple');
var expect = require('expect.js');

describe('SimpleEventDistributor', function() {
  var distributor;
  beforeEach(function() {
    distributor = new Distributor();
  });
  describe('#addHandler', function() {
    it('adds handler that will be called when notify is called', function() {
      var count = 0;

      distributor.addHandler(function() { ++count; });

      distributor.notify();
      expect(count).to.eql(1);
    });
    it('returns the added handler', function() {
      var handler = function() { throw new Error('Im not called yet.'); };

      var returnValue = distributor.addHandler(handler);

      expect(returnValue).to.eql(handler);
    });
  });

  describe('#notify', function() {
    it('calls all handlers every time', function() {
      var count = 0;
      distributor.addHandler(function() { ++count; });
      expect(count).to.eql(0);

      distributor.notify();
      distributor.notify();
      distributor.notify();

      expect(count).to.eql(3);
    });

    it('passes the given event to every handler', function() {
      var passedEvent = { name: 'MyEvent' };
      distributor.addHandler(function(evt) { expect(evt).to.eql(passedEvent); });

      distributor.notify(passedEvent);
    });
  });
});
