
var eventStore = require('../event_stores/memory')();
var DomainEvent = require('../domain_event');

var addPostEvent = new DomainEvent('publishPost', 1, {
  title: 'MyTitle',
  content: 'Lala'
});

var updatePostEvent = new DomainEvent('editPost', 1, {
  title: 'Test2'
});

var addCommentEvent = new DomainEvent('publishComment', 1, {
  content: 'Lala',
  postId: 1
});

eventStore.push(addPostEvent);
// eventStore.push(updatePostEvent);
// eventStore.push(addCommentEvent);

var distributor = require('../event_distributors/simple')();


var fs   = require('fs'),
    path = require('path');

function loadModels(dirs) {
  return dirs.map(function(dir) {
    return fs.readdirSync(dir).map(function(file) {
      return require(path.join(dir, file));
    });
  }).reduce(function(a, b) {
    return a.concat(b);
  });
}

function loadCommands(dir) {
  return fs.readdirSync(dir).map(function(file) {
    return require(path.join(dir, file));
  });
}

var app = new require('../application')({
  eventStore: eventStore,
  commandsDir: loadCommands(__dirname + '/commands/'),
  eventHandlers: loadModels([__dirname + '/domain/', __dirname + '/views/']),
  eventDistributor: distributor
});

distributor.addHandler(function(event) {
  console.log("RECEIVED EVENT", event);
});


// app.runCommand('publishPost', {
//   title: 'MyTitle',
//   content: 'Lala'
// });
// var postId = Object.keys(require('./domain/posts.js').posts)[0];
var postId = 1;
console.log("POSTID:", postId);

app.runCommand('publishPost', {
  title: 'MyTitle',
  content: 'Lala2'
}, function(err) {
  console.log("ERROR", err);
});

app.runCommand('publishComment', {
  content: 'Super Kommentar',
  postId: postId
});

app.runCommand('editPost', {
  title: 'My Title',
  content: 'So cool',
  postId: postId
});

app.runCommand('editPost', {
  content: 'So cool in here!',
  postId: postId
});

app.runCommand('publishComment', {
  content: 'Again!',
  postId: postId
});

console.log(eventStore.all());

console.log('THREAD:', require('./views/thread_view.js').posts);


// // In Domain:
// var PostLogic = {
//   PublishPost: function PublishPost(data) {
//     return {
//       isValid: function() {
//         return data.title === '';
//       },
//       run: function() {
//         if (!this.isValid()) { return new Error('Geht nicht.'); }
//         return new DomainEvent('addPost', DomainEvent.CREATE, 'Post', 1, {
//           title: 'MyTitle',
//           content: 'Lala'
//         });
//       }
//     };
//   }
// };


// Command.create = function(type, data) {
//   new ({
//     'addPost': PostLogic.PublishPost
//   })[type](data);
// };



// // In View having App-Part (posts.js or something):
// var posts = {};
// function Post(data) {
//   this.title = data.title;
// }
// Post.prototype.update = function update(data) {
//   this.title = data.title;
// };

// EventBus.addListener(function(evt) {
//   if (evt.aggregateType == 'Post') {
//     switch(evt.type) {
//       case 'create':
//         posts[evt.aggregateId] = new Post(evt.data);
//         break;
//       case 'update':
//         posts[evt.aggregateId].updata(evt.data);
//         break;
//       case 'delete':
//         delete posts[evt.aggregateId];
//         break;
//     }
//   }
// });



// // DARIOs STUFF:
// function Post() {}

// Post.prototype.handleEvent = function(event) {
//   // domain logic doesn't require state
//   // nothing to see here because of that
// }

// Post.prototype.add = function(data, cb) {
//   if (data.title === '') {
//     return cb({title: 'empty'});
//   }

//   return cb(null, {
//     title: data.title,
//   });
// };

// Post.prototype.edit = function(data) {
//   return DomainEvent('PostEdited', {
//     return
//   });
// };

// function Application() {}

// Application.prototype.handleCommand = function(command) {
//   var post, event;
//   switch (command.name) {
//   case 'addPost':
//       post = new Post();
//       event = post.add(command.data);
//       if (event instanceof DomainEvent) {
//         this.eventStore.push(event);
//         this.subscribers.notifyAbout(event);
//       } else {
//         throw InvalidCommand(event);
//       }
//   case 'editPost':
//       post = new Post();
//       this.eventStore.getOfId(command.postId).forEach(function(event) {
//         post.handleEvent(event);
//       });
//       event = post.edit({newTitle: command.newTitle});
//   }
// };


// var events = eventStore.all();
// var posts = {};

// events.forEach(function(evt) {
//   if (evt.aggregateType == 'Post') {
//     switch(evt.type) {
//       case 'create':
//         posts[evt.aggregateId] = evt.data;
//         break;
//       case 'update':
//         Object.keys(evt.data).forEach(function(key) {
//           posts[evt.aggregateId][key] = evt.data[key];
//         });
//         break;
//       case 'delete':
//         delete posts[evt.aggregateId];
//         break;
//     }
//   }
// });

// console.log("POSTS", posts);
