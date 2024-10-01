const Place = require("../models/Place");
const User = require("../models/User");
const HttpError = require("../models/HttpError");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const createPlace = async (req, res, next) => {
  
  
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new HttpError("Inputs does'not Meet the Requirements", 422);
    return next(error);
  }
  const { title, description, address } = req.body;

  if(!req.file){
    const error = new HttpError("Image is Invalid", 422);
    return next(error);
  }

  let currUser;
  try {
    currUser = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      "creating place resulted in error, try again",
      500
    );
    return next(error);
  }

  if (!currUser) {
    const error = new HttpError("user does not exist, try again", 404);
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    address,
    imgPath: req.file.path,
    creator: req.userData.userId,
  });

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session: session });
    currUser.places.push(createdPlace);
    await currUser.save({ session: session });
    session.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "creating place resulted in error, try again",
      500
    );
    return next(error);
  }

  res.json(createdPlace.toObject());
};

const getPlaces = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (err) {
    const error = new HttpError("something went wrong", 500);
    return next(error);
  }

  if (!places) {
    const error = new HttpError("uid does not exists", 404);
    return next(error);
  }
  if (places.length === 0) {
    const error = new HttpError("This user has no places", 404);
    return next(error);
  }

  res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("something went wrong", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("pid does not exists", 404);
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const editPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new HttpError("Inputs does'not Meet the Requirements", 422);
    return next(error);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("something went wrong", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("pid does not exists", 404);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("unauthorized access", 401);
    return next(error);
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "editing place resulted in error, try again",
      500
    );
    return next(error);
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError("something went wrong", 500);
    return next(error);
  }

  if (!place) {
    const error = new HttpError("pid does not exists", 404);
    return next(error);
  }

  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("unauthorized access", 401);
    return next(error);
  }

  try {
    await place.deleteOne();
  } catch (err) {
    const error = new HttpError(
      "deleting place resulted in error, try again",
      500
    );
    return next(error);
  }

  res.json({ message: "deleted place" });
};

exports.createPlace = createPlace;
exports.getPlaces = getPlaces;
exports.getPlaceById = getPlaceById;
exports.editPlace = editPlace;
exports.deletePlace = deletePlace;
