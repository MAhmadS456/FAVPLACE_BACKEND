const express = require("express");
const fs = require('fs');
const cors = require('cors');
const bodyParser = require("body-parser");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const path = require('path');

const mongoose = require("mongoose");
const app = express();

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', 'Authorization');
  next();
})

app.use(bodyParser.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use("/places", placesRoutes);

app.use("/users", usersRoutes);

app.use((err, req, res, next) => {
  if(req.file){
    fs.unlink(req.file.path, (err)=>{
      console.log(err);
    });
  }

  if (res.headerSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({ message: err.message || "An unknown error occured!" });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${encodeURIComponent(
      process.env.DB_PASS
    )}@cluster0.atajhc9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => app.listen(5000))
  .catch((error) => console.log(error));
