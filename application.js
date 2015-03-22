
function loadCommands(cmdObjs) {
  var commands = {};

  cmdObjs.forEach(function(cmds) {
    Object.keys(cmds).forEach(function(cmd) {
      if (commands[cmd]) {
        throw new Error('Commands can only be processed by one aggregate. But command "' + cmd + '" has at least two handlers.');
      }
      commands[cmd] = cmds[cmd];
    });
  });
  return commands;
}

function Application(config) {
  var eventStore = config.eventStore,
      eventHandlers = config.eventHandlers,
      commands = loadCommands(config.commands),
      eventDistributor = config.eventDistributor,

      app;

  app = {
    eventStore: eventStore,
    eventDistributor: eventDistributor,
    runCommand: function(cmdName, data, cb) {
      if (!commands[cmdName]) {
        throw new Error('There is no handler of command "' + cmdName + '" defined.');
      }
      var command = new (commands[cmdName])(data);
      if (command.isValid()) {
        var events = command.run();
        eventStore.pushAll(events, function(err) {
          if (err) {
            if (cb) {
              cb({ type: 'EventStoreError', message: 'Events could not be pushed to event store', events: events, error: err });
            } else {
              throw new Error('Events could not be pushed to event store and no callback for response defined.');
            }
          } else {
            events.forEach(function(evt) {
              eventDistributor.notify(evt);
            });
            if (cb) { cb(null); }
          }
        });
      } else {
        if (cb) {
          cb({ type: 'CommandInvalidError', message: 'Command is invalid', errors: command.errors() });
        } else {
          throw new Error('Command "' + cmdName + '" is invalid and no callback for response defined.');
        }
      }
    },

    replayEvents: function(cb) {
      eventStore.all(function(err, events) {
        (events || []).forEach(function(evt) {
          eventDistributor.notify(evt);
        });

        if (cb) { cb(null); }
      });
    }
  };

  eventHandlers.forEach(function(handler) {
    eventDistributor.addHandler(handler.handle);
  });
  app.replayEvents(config.afterInit);

  return app;
}

module.exports = Application;
