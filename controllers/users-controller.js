const User = require("../models/User");
const HttpError = require("../models/HttpError");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require("express-validator");

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError(
      "getting users resulted in error, try again",
      500
    );
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({getters: true})) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("login resulted in error, try again", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("email not valid, try again", 500);
    return next(error);
  }

  let isValidPass;
  try {
    isValidPass = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new HttpError("login resulted in error, try again", 500);
    return next(error);
  }

  if (!isValidPass) {
    const error = new HttpError("password not valid, try again", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign({userId: user.id}, `${process.env.JWT_KEY}`, {expiresIn: '1h'});
  } catch (err) {
    const error = new HttpError("generating token failed resulted in error, try again", 500);
    return next(error);
  }
  res.status(200).json({userId: user.id, token});
};

const signup = async (req, res, next) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new HttpError("Inputs does'not Meet the Requirements", 422);
    return next(error);
  }
  const { email, name, password } = req.body;
  if(!req.file){
    const error = new HttpError("Image is Invalid", 422);
    return next(error);
  }

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("signing up resulted in error, try again", 500);
    return next(error);
  }

  if (user) {
    const error = new HttpError("user already exists, try logging in", 422);
    return next(error);
  }

  let hashedPass;
  try{
    hashedPass = await bcrypt.hash(password, 12);
  }catch(err){
    const error = new HttpError("signing up resulted in error, try again", 500);
    return next(error);
  }

  const newUser = new User({
    email,
    name,
    password: hashedPass,
    imgPath: req.file.path,
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    const error = new HttpError("signing up resulted in error, try again", 500);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign({userId: newUser.id}, `${process.env.JWT_KEY}`, {expiresIn: '1h'});
  } catch (err) {
    const error = new HttpError("generating token failed, try again", 500);
    return next(error);
  }
  res.status(200).json({userId: newUser.id, token});
};

exports.getAllUsers = getAllUsers;
exports.login = login;
exports.signup = signup;
