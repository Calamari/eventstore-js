var DomainEvent = require('../../domain_event'),

    Comments = require('../domain/comments'),

    uuid = require('node-uuid');

module.exports = {
  publishComment: function PublishComment(data) {
    var errors = [];
    return {
      isValid: function() {
        if (!data.content) {
          errors.push('Content has to be defined.');
          return false;
        }
        if (!data.postId) {
          errors.push('Comment has to be added to a post.');
          return false;
        }
        return true;
      },
      errors: function() { return errors; },
      run: function() {
        return [new DomainEvent('publishComment', uuid.v1(), {
          content: data.content,
          postId: data.postId
        })];
      }
    };
  }
};
