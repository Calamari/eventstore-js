
/**
 * Pretty useless except for testing purposes and trying out things
 * Use as interface reference
 */
function EventMemoryStore() {
  var events = [];

  return {
    all: function all(cb) { cb(null, events); },
    push: function push(event, cb) {
      events.push(event);

      cb && cb(null);
    },
    pushAll: function push(eventsArray, cb) {
      eventsArray.forEach(function(event) {
        events.push(event);
      });

      cb && cb(null);
    },
    getOfId: function getOfId(aggregateId, cb) {
      cb(null, events.filter(function(evt) { return evt.aggregateId === aggregateId; }));
    }
  };
}

module.exports =  EventMemoryStore;
