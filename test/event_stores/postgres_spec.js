
var EventStore = require('../../event_stores/postgres');
var expect = require('expect.js');
var pg = require('pg');

describe('EventPostgresStore', function() {
  var dbConfig = {
    username: 'calamari',
    password: '12test34',
    host: 'localhost',
    database: 'event_sourcing_test'
  };
  var store,
      event1 = { name: 'MyEvent1', aggregateId: '12345678-1234-5678-90ab-1234567890ab', data: { foo: 42 }, createdAt: new Date(1) },
      event2 = { name: 'MyEvent2', aggregateId: '22345678-1234-5678-90ab-1234567890ab', data: { foo: 'bar' }, createdAt: new Date(2) },
      event3 = { name: 'MyEvent3', aggregateId: '12345678-1234-5678-90ab-1234567890ab', data: {}, createdAt: new Date(3) };

  // Clean DB before test
  beforeEach(function(done) {
    var connectionString = [
      "postgres://",
      (dbConfig.username || 'root'),
      ":",
      (dbConfig.password || ''),
      "@",
      (dbConfig.host || 'localhost'),
      "/",
      dbConfig.database
    ].join('');
    var tableName = dbConfig.tableName || 'domain_events';

    pg.connect(connectionString, function(err, client, clientDone) {
      if (err) {
        return done(err);
      }
      client.query('DELETE FROM ' + tableName, function(err) {
        clientDone();
        done(err);
      });
    });
  });
  beforeEach(function() {
    store = new EventStore(dbConfig);
  });

  describe('#push', function() {
    it('adds Events to store', function(done) {
      store.push(event1, function(err) {
        expect(err).to.eql(null);

        store.all(function(err, events) {
          expect(events.length).to.eql(1);

          store.push(event2, function(err) {
            expect(err).to.eql(null);

            store.all(function(err, events) {
              expect(events.length).to.eql(2);

              done();
            });
          });
        });
      });
    });
  });

  describe('#pushAll', function() {
    it('adds multiple Events at once to store', function(done) {
      store.pushAll([event1, event2], function(err) {
        expect(err).to.eql(null);

        store.all(function(err, events) {
          expect(events.length).to.eql(2);

          done();
        });
      });
    });
  });

  describe('#all', function() {
    beforeEach(function(done) { store.push(event1, done); });
    beforeEach(function(done) { store.push(event2, done); });
    beforeEach(function(done) { store.push(event3, done); });

    it('returns all previously added events', function(done) {
      store.all(function(err, events) {
        expect(err).to.eql(null);

        expect(events[0].name).to.eql('MyEvent1');
        expect(events[1].name).to.eql('MyEvent2');
        expect(events[2].name).to.eql('MyEvent3');
        done();
      });
    });
  });

  describe('#getOfId', function() {
    beforeEach(function(done) { store.push(event1, done); });
    beforeEach(function(done) { store.push(event2, done); });
    beforeEach(function(done) { store.push(event3, done); });

    it('only returns events that match aggregateId', function(done) {
      store.getOfId('12345678-1234-5678-90ab-1234567890ab', function(err, events) {
        expect(err).to.eql(null);

        expect(events.length).to.eql(2);
        expect(events[0].name).to.eql('MyEvent1');
        expect(events[0].aggregateId).to.eql('12345678-1234-5678-90ab-1234567890ab');
        expect(events[1].name).to.eql('MyEvent3');
        expect(events[1].aggregateId).to.eql('12345678-1234-5678-90ab-1234567890ab');
        done();
      });
    });
  });
});
