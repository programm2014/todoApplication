require("./config/config");
var express = require("express"),
	mongoose = require("mongoose"),
	bodyParser =require("body-parser"),
	methodOverride = require("method-override"),
	ejs = require("ejs"),
	bcrypt = require("bcryptjs");
mongoose.Promise = global.Promise;
    var uri =process.env.MONGODB_URI;
    	mongoose.connect(uri, (err)=>{
    		if(err){
    			console.log(err);
    		}
    	});

	var app = express();

	app.set("view engine", "ejs");

	app.use(express.static("public"));
	app.use(bodyParser.json());
	app.use(methodOverride("_method"));
	

	var Todo = require("./models/todo.js");
	var User = require("./models/users.js");
	var {authenticate} = require("./midleware/authenticate.js");

	app.get("/", (req, res)=>{

		Todo.find({}, function(err, todosfound){
			if(err){
				console.log(err);
				res.render("index");
			}else {
				console.log(todosfound);
				res.render("index", {todos : todosfound});
			}
		});
		

	});

	app.get("/todos", authenticate, (req, res)=>{

		Todo.find({_creator: req.user.id}, function(err, todosfound){
			if(err){
				console.log(err);
				//res.render("index");
			}else {
				res.send(todosfound);
				//res.render("index", {todos : todosfound});
			}
		});
		

	});

	app.post("/todo", authenticate, (req, res)=>{
			console.log(res.data);
			var title;
			if(req.body.data){
				title = req.body.data.title;
			}else {
				title = req.body.title;
			}
		Todo.create({title:title, _creator: req.user._id}, (err, todo)=>{

			if(err){
				console.log(err);
			}else{
				res.send(todo);
			}
		});

	});

	app.get("/todo/:id/edit", (req, res)=>{
			var id = req.params.id;
		Todo.findById(id,function(err, foundTodo){
			if(err){
				console.log(err);
			}else {
				res.send(foundTodo);
			}
		});

	});

	app.put("/todo/:id", authenticate, (req, res)=>{
		var id = req.params.id;
	
		Todo.find({_id: id}, (err, todo)=>{

			if(todo.length > 0){
				var creatorId =todo[0]._creator;
			}else {
				res.status(404).send("not found");
			}
			
			if(req.user._id.equals(creatorId)){
				Todo.findByIdAndUpdate(id, {title: req.body.title}, function(err, updatetodo){

					if(err){
						console.log(err);
			 		}else {
						res.send(updatetodo);
					}
				});
  
			}else {
				res.status(404).send("not found");
			}
		});
		
	}); 

	app.delete("/todo/:id", authenticate, (req, res)=>{
		var id = req.params.id;

		Todo.find({_id: id}, (err, todo)=>{
			 if(err){
			 	res.status(404).send("not found");
			 }
              console.log(todo);
			  if(todo.length >= 1){
			  	var creatorId =todo[0]._creator;
			  }else {
			  	res.status(404).send("not found");
			  }
			if(req.user._id.equals(creatorId)){
				Todo.findByIdAndRemove(id, function(err, tododeleted){

					if(err){
						console.log(err);
			 		}else {
						res.send("deleted" + tododeleted.title);
					}
				});
  
			}else {
				res.status(404).send("not found");
			}
		});

		
	});

	/************USERS*************************/
	app.get("/users/new", (req, res)=>{
         res.render("register");
	});
	app.get("/users/login", (req, res)=>{
         res.render("login");
	});
	app.post("/user", (req, res)=>{
		console.log(req.body);

			var user = new User(req.body);

			user.save().then((user)=>{
				return user.generateAuthToken();
				req.user = user;
				//res.send(user);
			}).then((token) =>{

				res.header("x-auth", token).send(user);
				

			}).catch((e)=>{
				res.status(400).send(e);
			});
	});



app.get("/users/me", authenticate, (req, res)=>{
  res.send(req.user);
});

app.post("/users/login", (req, res)=>{
console.log(req.body.email);
	User.findByCredentials(req.body).then((user)=>{
		req.user = user;
		var password = req.body.password;
		var hashPass = user.password;
		bcrypt.compare(password, hashPass, function(err, re) {
    		if(re){
    			user.generateAuthToken().then((token)=>{
    				res.header("x-auth", token).send(user);
    			})
    			
    		}else {
    			res.status(404).send("not found");
    		}
		});

 	}).catch((e)=>{
 		res.status(404).send("not found5");
 	});

  });

	app.delete("/users/me/logout", authenticate, (req, res)=>{
  
		req.user.removeToken(req.token).then(()=>{
			res.status(200).send();
		}).catch((e)=>{
			res.status(404).send();
		})

    });

	app.listen(process.env.PORT, ()=>{

		console.log("server running..........");
	});


