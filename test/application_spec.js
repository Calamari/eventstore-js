
var Application = require('../application');
var expect = require('expect.js');

describe('Application', function() {
  var app, eventStore, eventDistributor;
  describe('#runCommand', function() {
    var theCommand, dataCommandReceived, shouldBeValid, stubEvent, runCalled, eventHandler;
    beforeEach(function() {
      eventStore = new (require('../event_stores/memory'))();
      eventDistributor = new (require('../event_distributors/simple'))();
      dataCommandReceived = null;
      shouldBeValid = false;
      runCalled = false;
      stubEvent = {
        name: 'name',
        aggregateId: 'aggregateId',
        data: 'data',
        createdAt: 'now'
      };
      stubEvent = {
        name: 'name',
        aggregateId: 'aggregateId',
        data: 'data2',
        createdAt: 'now'
      };
      eventHandler = {
        handle: function(evt) {
          eventHandler.event = evt;
        }
      };
      theCommand = function(data) {
        dataCommandReceived = data;
        return {
          isValid: function() {
            return shouldBeValid;
          },
          errors: function() { return 'NICE ERRORS'; },
          run: function() {
            runCalled = true;
            return [stubEvent];
          }
        };
      };
      theCommand2 = function(data) {
        dataCommandReceived = data;
        return {
          isValid: function() {
            return shouldBeValid;
          },
          errors: function() { return 'NICE ERRORS'; },
          run: function() {
            runCalled = true;
            return [stubEvent, stubEvent2];
          }
        };
      };
      app = new Application({
        eventStore: eventStore,
        eventDistributor: eventDistributor,
        commands: [{ theCommand: theCommand }],
        eventHandlers: [eventHandler]
      });
    });

    it('throws error if command is not defined', function() {
      expect(function() {
        app.runCommand('dontExist', {});
      }).to.throwError('There is no handler of command "dontExist" defined.');
    });

    it('runs the command with data we passed in', function() {
      var myObj = { foo: 42 };

      app.runCommand('theCommand', myObj, function() {});

      expect(dataCommandReceived).to.eql(myObj);
    });

    describe('without a callback', function() {
      it('throws error if command is invalid', function() {
        var myObj = { foo: 42 };

        expect(function() {
          app.runCommand('theCommand', { foo: 42 });
        }).to.throwError('Command "theCommand" is invalid and no callback for response defined.');

        expect(dataCommandReceived).to.eql(myObj);
      });

      it('throws error if events could not be pushed to event store', function() {
        shouldBeValid = true;
        eventStore.pushAll = function(events, cb) {
          cb({ error: 'Yes' });
        };

        expect(function() {
          app.runCommand('theCommand', {});
        }).to.throwError('Events could not be pushed to event store and no callback for response defined.');
      });
    });

    describe('with a callback', function() {
      it('passes error to callback if command is invalid', function() {
        var myObj = { foo: 42 };

        app.runCommand('theCommand', { foo: 42 }, function(err) {
          expect(err).to.eql({ type: 'CommandInvalidError', message: 'Command is invalid', errors: 'NICE ERRORS' });
        });

        expect(dataCommandReceived).to.eql(myObj);
      });

      it('returns an error if events could not be pushed to event store', function(done) {
        var myError = { error: 'Yes' };
        shouldBeValid = true;
        eventStore.pushAll = function(events, cb) {
          cb(myError);
        };

        app.runCommand('theCommand', {}, function(err) {
          expect(err).to.eql({
            type: 'EventStoreError',
            message: 'Events could not be pushed to event store',
            events: [stubEvent],
            error: myError
          });
          done();
        });
      });

      it('calls cb after all events are pushed to store and are dispatched', function(done) {
        shouldBeValid = true;
        var distributedEvents = [];
        eventStore.pushAll = function(events, cb) {
          cb(null);
        };
        eventDistributor.notify = function(evt) {
          distributedEvents.push(evt);
        };

        app.runCommand('theCommand', {}, function(err) {
          expect(err).to.eql(null);
          expect(distributedEvents).to.eql([stubEvent]);
          done();
        });
      });
      // TODO: rollback of command? Try again?
    });

    describe('if command is valid', function() {
      beforeEach(function() {
        shouldBeValid = true;
      });

      it('runs the command', function() {
        app.runCommand('theCommand', { foo: 42 });

        expect(runCalled).to.eql(true);
      });

      it('push the returned events into the event store', function(done) {
        app.runCommand('theCommand', { foo: 42 });

        eventStore.all(function(err, events) {
          expect(events).to.have.length(1);
          expect(events[0]).to.eql(stubEvent);

          done();
        });
      });

      it('notify all registered event handlers', function() {
        var anotherHandler = function(evt) {
          anotherHandler.event = evt;
        };
        eventDistributor.addHandler(anotherHandler);
        app.runCommand('theCommand', { foo: 42 });

        expect(eventHandler.event).to.eql(stubEvent);
        expect(anotherHandler.event).to.eql(stubEvent);
      });
    });

    it('pushes all events to event store in same order', function() {
    });
  });
});
// TODO: test afterIniit
// TODO: test with empty replay list
