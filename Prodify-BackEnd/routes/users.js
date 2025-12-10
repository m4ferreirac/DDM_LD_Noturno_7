const express = require("express");
const requireManager = require("../middlewares/requireManager");
const ctrl = require("../controllers/usersController");

const router = express.Router();

// Public info (any authenticated user)
router.get("/public/names", ctrl.listUsersPublic);

// Manager-only
router.post("/", requireManager, ctrl.createUser);
router.get("/", requireManager, ctrl.listUsers);

// Self or manager
router.get("/:uid", ctrl.getUser);

// Manager-only
router.patch("/:uid", requireManager, ctrl.updateUser);
router.delete("/:uid", requireManager, ctrl.deleteUser);

// Reset password (manager-only)
router.post("/:uid/reset-password", requireManager, ctrl.resetPassword);

module.exports = router;
