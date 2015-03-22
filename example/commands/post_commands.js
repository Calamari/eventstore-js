var DomainEvent = require('../../domain_event'),

    Posts = require('../domain/posts'),

    uuid = require('node-uuid');

function validatePost(data, errors) {
  if (!data.title) {
    errors.push('Title has to be defined');
    return false;
  }
  if (Posts.isTitleUsed(data.title)) {
    errors.push('Title has to be unique');
    return false;
  }
}

module.exports = {
  publishPost: function publishPost(data) {
    var errors = [];
    return {
      isValid: function() {
        if (!data.title) {
          errors.push('Title has to be defined');
          return false;
        }
        if (Posts.isTitleUsed(data.title)) {
          errors.push('Title has to be unique');
          return false;
        }
        return !errors.length;
      },
      errors: function() { return errors; },
      run: function() {
        return [new DomainEvent('publishPost', uuid.v1(), {
          title: 'MyTitle',
          content: data.content
        })];
      }
    };
  },
  editPost: function editPost(data) {
    var errors = [];
    return {
      isValid: function() {
        // TODO: if title belongs to the same object, it should be ok...
        if (data.title && Posts.isTitleUsed(data.title)) {
          errors.push('Title has to be unique');
          return false;
        }
        return !errors.length;
      },
      errors: function() { return errors; },
      run: function() {
        if (data.title || data.content) {
          return [new DomainEvent('updatePost', data.postId, data)];
        }
        return [];
      }
    };
  }
};
