const express = require("express");
const router = express.Router();
const ROLE_LIST = require("../../config/roles_list");

const employeeControllers = require("../../controllers/employeesController");
const verifyRoles = require("../../middleware/verifyRoles");

router
    .route("/")
    .get(employeeControllers.getAllEmployees)
    .post(
        verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor),
        employeeControllers.createNewEmployee
    )
    .put(
        verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Editor),
        employeeControllers.updateEmployee
    )
    .delete(verifyRoles(ROLE_LIST.Admin), employeeControllers.deleteEmployee);

router.route("/:id").get(employeeControllers.getAnEmployee);

module.exports = router;
