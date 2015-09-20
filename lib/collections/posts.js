// global posts collection
Posts = new Mongo.Collection('posts');

// validation
validatePost = function(post) {
	var errors = {};
	if (!post.title)
		errors.title = "Please fill in a headline";
	if (!post.url)
		errors.url = "Please fill in a URL";
	return errors;
}

// allow users to edit and delete their posts
Posts.allow({
	update: function(userId, post) {
		return ownsDocument(userId, post);
	},
	remove: function(userId, post) {
		return ownsDocument(userId, post);
	}
});

// allow users to ONLY edit url and title attributes
Posts.deny({
	update: function(userId, post, fieldNames) {
		return (_.without(fieldNames, 'url', 'title').length > 0);
	}
});
// validation errors
Posts.deny({
  	update: function(userId, post, fieldNames, modifier) {
    	var errors = validatePost(modifier.$set);
    	return errors.title || errors.url;
  	}		
});

Meteor.methods({
	// add new posts to the db
	postInsert: function(postAttributes) {
		check(Meteor.userId(), String);
		check(postAttributes, {
			title: String,
			url: String
		});

		var errors = validatePost(postAttributes);
		if (errors.title || errors.url)
			throw new Meteor.Error('invalid-post', "You must set a title and url for your post.");

		var postWithSameLink = Posts.findOne({url: postAttributes.url});
		if (postWithSameLink) {
			return {
				postExists: true,
				_id: postWithSameLink._id
			}
		}

		var user = Meteor.user();
		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username,
			submitted: new Date(),
  			commentsCount: 0,
			upvoters: [],
			votes: 0
		});

		var postId = Posts.insert(post);

		return {
			_id: postId
		}
	},

	// upvoting
	upvote: function(postId) {
		check(this.userId, String);
		check(postId, String);

		// make sure post hasn't been voted on yet
		var affected = Posts.update({
			_id: postId,
			upvoters: {$ne: this.userId}
		}, {
			// add user to upvoters array and increment votes by 1
			$addToSet: {upvoters: this.userId},
			$inc: {votes: 1}
		});
		if (! affected)
			throw new Meteor.Error('invalid', "You weren't able to upvote that post");
	}
});
