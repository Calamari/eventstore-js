var redis = require("redis");

function RedisDistributor(cb) {
  var handlers = [],
      recvClient = redis.createClient(),
      sendClient = redis.createClient();
  recvClient.subscribe('eventSourcer.domainEvent');
  recvClient.on('message', function(channel, message) {
    var evt = JSON.parse(message);
    handlers.forEach(function(handler) {
      handler(evt);
    });
  });
  recvClient.on('ready', function() {
    sendClient.on('ready', function() {
      cb();
    });
  });

  return {
    notify: function(event) {
      sendClient.publish('eventSourcer.domainEvent', JSON.stringify(event));
    },
    addHandler: function(handler) {
      handlers.push(handler);
      return handler;
    },
    close: function() {
      recvClient.end();
      sendClient.end();
    }
  };
}

module.exports = RedisDistributor;
