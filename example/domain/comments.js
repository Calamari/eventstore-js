
var Comments = {
  titles: [],
  handle: function(event) {
    if (Comments.eventHandlers[event.name]) {
      Comments.eventHandlers[event.name](event);
    }
  },
  eventHandlers: {
    publishComment: function(event)  {
    }
  }
};

module.exports = Comments;
