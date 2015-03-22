function SimpleDistributor() {
  var handlers = [];

  return {
    handlers: handlers,
    notify: function(event) {
      handlers.forEach(function(handler) {
        handler(event);
      });
    },
    addHandler: function(handler) {
      handlers.push(handler);
      return handler;
    }
  };
}

module.exports = SimpleDistributor;
