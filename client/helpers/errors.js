// Local (client-only) collection for UI errors
Errors = new Mongo.Collection(null);

throwError = function(message) {
	Errors.insert({message: message});
}