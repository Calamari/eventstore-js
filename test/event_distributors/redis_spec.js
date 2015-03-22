
var Distributor = require('../../event_distributors/redis');
var expect = require('expect.js');

var redis = require("redis");

describe('RedisEventDistributor', function() {
  var distributor, clientSender, clientReceiver;
  before(function(done) {
    clientSender = redis.createClient();
    clientSender.on('ready', function() {
      console.log("TEST DONE");
      done();
    });
  });

  before(function(done) {
    clientReceiver = redis.createClient();
    clientReceiver.subscribe('eventSourcer.domainEvent');
    clientReceiver.on('ready', function() {
      console.log("TEST DONE");
      done();
    });
  });

  beforeEach(function(done) {
    distributor = new Distributor(done);
  });

  afterEach(function() {
    distributor.close();
  });

  describe('#addHandler', function() {
    it('adds handler that will be called when notify is called', function(done) {
      var count = 0;

      distributor.addHandler(function() {
        ++count;
        expect(count).to.eql(1);
        done();
      });

      clientSender.publish('eventSourcer.domainEvent', JSON.stringify({ test: 'me' }));
    });

    it('returns the added handler', function() {
      var handler = function() { throw new Error('Im not called yet.'); };

      var returnValue = distributor.addHandler(handler);

      expect(returnValue).to.eql(handler);
    });
  });

  describe('#notify', function() {
    it('calls all handlers every time', function(done) {
      var count = 0;
      distributor.addHandler(function(msg) {
        ++count;
        expect(msg).to.eql('msg' + count);
        if (count === 3) {
          done();
        }
      });
      expect(count).to.eql(0);

      distributor.notify('msg1');
      distributor.notify('msg2');
      distributor.notify('msg3');
    });

    it('passes the given event to every handler', function(done) {
      var passedEvent = { name: 'MyEvent' };
      distributor.addHandler(function(evt) {
        expect(evt).to.eql(passedEvent);
        done();
      });

      distributor.notify(passedEvent);
    });

    it('sends the event to all clients out there', function(done) {
      var passedEvent = { my: 42, foo: 'bar' };

      clientReceiver.on('message', function(channel, message) {
        expect(channel).to.eql('eventSourcer.domainEvent');
        expect(message).to.eql(JSON.stringify(passedEvent));
        done();
      });

      distributor.notify(passedEvent);
    });
  });
});
