var mongoose =require("mongoose");
var validator = require("validator");
var jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcryptjs");
var userSchema = new mongoose.Schema({
	email:{
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		unique: true,
		validate: {
			validator :(value)=>{
				return validator.isEmail(value);
			},
			message:"{VALUE} is note a valid email"
		}
	},
	password:{
		type: String,
		required: true,
		minlength: 6
	},
	tokens:[{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true
		}
	}]
});

userSchema.methods.toJSON = function(){
	var user = this;
	var userObject = user.toObject();
	return _.pick(userObject, ["_id","email"]);
};

userSchema.methods.generateAuthToken = function(){
	var user = this;
	var access = "auth";
	var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

	user.tokens.push({access, token});
	return user.save().then(()=>{
		return token;
	});
};
userSchema.methods.removeToken = function(token){
	var user =this;
	return user.update({
		$pull:{
			tokens:{
				token: token
			}
		}
	});
};

userSchema.pre("save", function(next){
	var user = this;
	if(user.isModified("password")){
		bcrypt.genSalt(10, (err, salt)=>{
			bcrypt.hash(user.password, salt,(err, hash)=>{
				user.password = hash;
				next();
			});
		});

	}else{

		next();
	}
});

userSchema.statics.findByToken = function(token){
	var User = this;
	var decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET);
	} catch(e) {
		return new Promise((resolve, reject)=>{
			reject();
		});
	}

	return User.findOne({
		_id: decoded._id,
		"tokens.token": token,
		"tokens.access": "auth"
	});
};

userSchema.statics.findByCredentials = function(object){
	var User = this;
	var email = object.email;
	var password = object.password;

return	User.findOne({
		email,
	});
};

module.exports = mongoose.model("User", userSchema);