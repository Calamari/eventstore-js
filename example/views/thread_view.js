
function Post(id, data) {
  this.id = id;
  Object.keys(data).forEach(function(key) {
    this[key] = data[key];
  });
  this.comments = [];
  console.log("THIS", this);
}

Post.prototype.addComment = function addComment(data) {
  this.comments.push(data);
};

function getPostById(id) {
  var post;
  ThreadView.posts.forEach(function(p) {
    if (p.id === id) {
      post = p;
    }
  });
  return post;
}

var ThreadView = {
  posts: [],
  handle: function(event) {
    if (ThreadView.eventHandlers[event.name]) {
      ThreadView.eventHandlers[event.name](event);
    }
  },
  eventHandlers: {
    publishPost: function(event)  {
      ThreadView.posts.push(new Post(event.aggregateId, event.data));
    },
    updatePost: function(event)  {
      var post = getPostById(event.aggregateId);
      if (event.data.title !== undefined) {
        post.title = event.data.title;
      }
      if (event.data.content !== undefined) {
        post.content = event.data.content;
      }
    },
    publishComment: function(event)  {
      var post = getPostById(event.data.postId);
      post.addComment(event.data);
    },
  }
};

module.exports = ThreadView;
