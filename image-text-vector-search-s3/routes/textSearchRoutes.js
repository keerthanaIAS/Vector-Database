const express = require("express");
const router = express.Router();
const {
    searchByText
} = require("../controllers/textSearchController");

router.post("/", searchByText);

module.exports = router;