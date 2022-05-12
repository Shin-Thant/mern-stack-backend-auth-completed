const express = require("express");
const router = express.Router();
const ROLE_LIST = require("../../config/roles_list");
const usersController = require("../../controllers/usersController");
const verifyRoles = require("../../middleware/verifyRoles");

router
    .route("/")
    .get(
        verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor),
        usersController.getAllUsers
    )
    .put(
        verifyRoles(ROLE_LIST.Editor, ROLE_LIST.Admin),
        usersController.updateUser
    )
    .delete(verifyRoles(ROLE_LIST.Admin), usersController.deleteUser);

router.get(
    "/:id",
    verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor),
    usersController.getOneUser
);

module.exports = router;
