const express = require("express");
const router = express.Router();

const {
  getUserRepositories,
  getRepository,
  deleteRepository,
} = require("../controllers/repositoryController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", getUserRepositories);
router.get("/:id", getRepository);
router.delete("/:id", deleteRepository);

module.exports = router;