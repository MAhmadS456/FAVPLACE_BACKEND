const { Router } = require("express");
const FileUpload = require("../middleware/file-upload");
const placesContoller = require("../controllers/places-controller");
const checkAuth = require("../middleware/check-auth");
const { check } = require("express-validator");

const router = Router();

router.get("/users/:uid", placesContoller.getPlaces);

router.get("/:pid", placesContoller.getPlaceById);

router.use(checkAuth);

router.post(
  "/",
  FileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 1, max: 30 }),
    check("address").isLength({ min: 1, max: 30 }),
  ],
  placesContoller.createPlace
);

router.patch(
  "/:pid",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 1, max: 30 }),
  ],
  placesContoller.editPlace
);

router.delete("/:pid", placesContoller.deletePlace);

module.exports = router;
