 // require the path module
var path = require("path");
// require express and create the express app
var express = require("express");
var app = express();
// require bodyParser sin
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
	extended: true
}));
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/message_board');

var Schema = mongoose.Schema;

var PostSchema = new mongoose.Schema({
	name: String, 
	message: String,
	comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
})

var CommentSchema = new mongoose.Schema({
	_post: {type: Schema.ObjectId, ref: 'Post'},
	name: String,
	comment: String
})

PostSchema.path('name').required(true, 'Name cannot be blank');
PostSchema.path('message').required(true, 'Message cannot be blank');
CommentSchema.path('name').required(true, 'Name cannot be blank');
CommentSchema.path('comment').required(true, 'Comment cannot be blank');

var Post = mongoose.model('Post', PostSchema);
var Comment = mongoose.model('Comment', CommentSchema);
// static content
app.use(express.static(path.join(__dirname, "./static")));
// set the views folder and set up ejs
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// root route
app.get('/', function(req, res) {
	Post.find({}).populate('comments').exec(function(err,posts) {	
		console.log(posts);
		if(err){
			console.log('something went wrong')
		}
		else {
			res.render('index', {posts: posts});
		}
	})
})
//route to add a user
app.post('/messages', function(req, res) {
	console.log("POST DATA", req.body);
	var post = new Post({name: req.body.name, message: req.body.message});

	post.save(function(err) {
    // if there is an error console.log that something went wrong!
   		if(err) {
    		console.log('something went wrong');
    		res.render('index', {title: 'you have errors!', errors: message.errors})
    	} else { // else console.log that we did well and then redirect to the root route
    		console.log('successfully added a message!');
    		res.redirect('/');
    	}
	})
})
app.post('/comments/:id', function(req, res){
	Post.findOne({_id: req.params.id}, function(err, post){
		var comment = new Comment({name: req.body.name, comment: req.body.comment} );
		comment._post = post._id;
		post.comments.push(comment);

		comment.save(function(err){
			post.save(function(err){
				if(err){
					console.log('Error');
				} else {
					res.redirect('/');
				}
			});
		});
	});
});
// listen on 8000
app.listen(8000, function() {
 console.log("listening on port 8000");
})
