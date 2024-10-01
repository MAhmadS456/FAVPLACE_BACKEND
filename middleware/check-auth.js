const HttpError = require("../models/HttpError");
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if(req.method === 'OPTIONS'){
    return next();
  }

  //Authorization: 'Bearer TOKEN'
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw "nothing";
    }
    
    //throw error if verification failed
    const decodedTkn = jwt.verify(token, 'mynameisahmad');

    req.userData = {userId: decodedTkn.userId};
    next();
  } catch (err) {
    const error = new HttpError("Authentication Failed", 401);
    return next(error);
  }
};
