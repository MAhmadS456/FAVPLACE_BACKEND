const uniqueValidator = require('mongoose-unique-validator');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    imgPath: {type: String, required: true},
    places: [{type: mongoose.Types.ObjectId, required: true, Ref:'Place'}]
});
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
