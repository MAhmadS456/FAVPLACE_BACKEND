const mongoose = require('mongoose');

const Schema = require('mongoose').Schema;

const placeSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    address: {type: String, required: true},
    imgPath: {type: String, required: true},
    creator: {type: mongoose.Types.ObjectId, required: true, Ref:'User'}
});

module.exports = mongoose.model('Place', placeSchema);