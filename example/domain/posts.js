
var TitleCache = {
  titles: [],
  include: function includeTitle(title) {
    return this.titles.indexOf(title) !== -1;
  },
  add: function addTitle(title) {
    this.titles.push(title);
  },
  replace: function replaceTitle(oldTitle, newTitle) {
    var indexOfOldTitle = this.titles.indexOf(oldTitle);
    this.titles.splice(indexOfOldTitle, 1);
    this.titles.push(newTitle);
  }
};

var Posts = {
  // for fast access
  posts: {},
  handle: function(event) {
    if (Posts.eventHandlers[event.name]) {
      Posts.eventHandlers[event.name](event);
    }
  },
  eventHandlers: {
    publishPost: function(event)  {
      TitleCache.add(event.data.title);
      Posts.posts[event.aggregateId] = event.data;
    },
    updatePost: function(event)  {
      var post = Posts.getPostData(event.aggregateId);
      if (event.data.title !== undefined) {
        TitleCache.replace(post.title, event.data.title);
        post.title = event.data.title;
      }
      if (event.data.content !== undefined) {
        post.content = event.data.content;
      }
    }
  },

  isTitleUsed: function(title) {
    return TitleCache.include(title);
  },

  getPostData: function(postId) {
    return Posts.posts[postId];
  }
};

module.exports = Posts;
