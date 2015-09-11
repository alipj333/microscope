// query all posts
Meteor.publish('posts', function() {
	return Posts.find();
});

// query individual posts
Meteor.publish('singlePost', function(id) {
	check(id, String);
	return Posts.find(id);
});

// query comments based on post id
Meteor.publish('comments', function(postId) {
  	check(postId, String);
  	return Comments.find({postId: postId});
});

// query notifications based on user and read status
Meteor.publish('notifications', function() {
	return Notifications.find({userId: this.userId, read: false});
});