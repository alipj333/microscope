Router.configure({
	layoutTemplate: 'layout',
	loadingTemplate: 'loading',
	notFoundTemplate: 'notFound',
	waitOn: function() {
		return [Meteor.subscribe('posts'), Meteor.subscribe('notifications')]
	}
});

// homepage
Router.route('/', {name: 'postsList'});

// post show
Router.route('/posts/:_id', {
	name: 'postPage',
	waitOn: function() {
		return Meteor.subscribe('comments', this.params._id);
	},
	data: function() {
		return Posts.findOne(this.params._id);
	}
});

// post edit
Router.route('/posts/:_id/edit', {
	name: 'postEdit',
	data: function() {
		return Posts.findOne(this.params._id);
	}
});

// post submit
Router.route('/submit', {name: 'postSubmit'});

// login check
var requireLogin = function() {
	if (! Meteor.user()) {
		if (Meteor.loggingIn()) {
			this.render(this.loadingTemplate);
		} else {
			this.render('accessDenied');
		}
	} else {
		this.next();
	}
}

Router.onBeforeAction('dataNotFound', {only: 'postPage'});
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});