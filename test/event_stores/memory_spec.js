
var EventStore = require('../../event_stores/memory');
var expect = require('expect.js');

describe('EventMemoryStore', function() {
  var store;

  beforeEach(function() {
    store = new EventStore();
  });

  describe('#push', function() {
    it('adds Events to store', function(done) {
      store.push({ name: 'MyEvent1' });

      store.all(function(err, events) {
        expect(events.length).to.eql(1);

        store.push({ name: 'MyEvent2' });

        store.all(function(err, events) {
          expect(events.length).to.eql(2);

          done();
        });
      });
    });
  });

  describe('#pushAll', function() {
    it('adds multiple events at once to store', function(done) {
      store.pushAll([{ name: 'MyEvent1' }, { name: 'MyEvent2' }], function(err) {
        expect(err).to.eql(null);

        store.all(function(err, events) {
          expect(events.length).to.eql(2);

          done();
        });
      });
    });
  });

  describe('#all', function() {
    beforeEach(function() {
      store.push({ name: 'MyEvent1' });
      store.push({ name: 'MyEvent2' });
      store.push({ name: 'MyEvent3' });
    });

    it('returns all previously added events', function(done) {
      store.all(function(err, events) {
        expect(err).to.eql(null);

        expect(events[0]).to.eql({ name: 'MyEvent1' });
        expect(events[1]).to.eql({ name: 'MyEvent2' });
        expect(events[2]).to.eql({ name: 'MyEvent3' });
        done();
      });
    });
  });

  describe('#getOfId', function() {
    beforeEach(function() {
      store.push({ name: 'MyEvent1', aggregateId: 1 });
      store.push({ name: 'MyEvent2', aggregateId: 2 });
      store.push({ name: 'MyEvent3', aggregateId: 1 });
    });

    it('only returns events that match aggregateId', function(done) {
      store.getOfId(1, function(err, events) {
        expect(err).to.eql(null);

        expect(events.length).to.eql(2);
        expect(events[0]).to.eql({ name: 'MyEvent1', aggregateId: 1 });
        expect(events[1]).to.eql({ name: 'MyEvent3', aggregateId: 1 });
        done();
      });
    });
  });
});
