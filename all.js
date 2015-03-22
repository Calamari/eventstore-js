function SourceEvent(name, type, aggregateType, aggregateId, data) {

}

SourceEvent.prototype.toJSON = function toJSON() {
  return JSON.stringify(this);
};
SourceEvent.fromJSON = function fromJSON(json) {
  var evt = new SourceEvent();
  Object.merge(evt, JSON.parse(json));
  return evt;
};

SourceEvent.CREATE = 'create';
SourceEvent.UPDATE = 'update';
SourceEvent.DELETE = 'delete';


new SourceEvent('writePost', SourceEvent.CREATE, 'Post', 1, {
  title: 'Test',
  content: 'lala'
});

new SourceEvent('updatePost', SourceEvent.UPDATE, 'Post', 1, {
  title: 'Test2'
});
new SourceEvent('deletePost', SourceEvent.DELETE, 'Post', 1);

var EventBus = {
  init: function(adapter) {
    this.adapter = adapter;
  },
  publish: function(event) {
    if (!this.adapter) {
      throw new Error('EventBus was not initialized with adapter');
    }
    this.adapter.publish(handler);
  },
  register: function(handler) {
    if (!this.adapter) {
      throw new Error('EventBus was not initialized with adapter');
    }
    this.adapter.register(handler);
  }
};

function EventBusNodeAdapter() {
  var bus = require('events').EventEmitter;

  return {
    publish: function publish(event) {
      bus.emit('sourceEvent', event);
    },
    register: function register(handler) {
      bus.on('sourceEvent', handler);
    }
  };
}

function EventStorePostgres(config) {
  // TODO: connect
  return {
    all: function all() {},
    push: function push(event) {},
    getOfId: function getOfId(aggregateId) {}
  };
}

function EventStoreMemory() {
  var events = [];

  return {
    all: function all() { return events; },
    push: function push(event) { events.push(event); },
    getOfId: function getOfId(aggregateId) {
      return events.filter(function(evt) { return evt.aggregateId === aggregateId; });
    }
  };
}


function Command() {
  this.stateBefore = null;
}
Command.prototype = {
  run: function(data) {},
  undo: function() {}
};

function AjaxCommand() {
  this.stateBefore = null;
  this.verified = false;
}
AjaxCommand.prototype = {
  run: function(data) {},
  undo: function() {}
};
