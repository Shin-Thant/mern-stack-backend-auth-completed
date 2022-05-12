const Employee = require("../model/Employee");

const getAllEmployees = async (req, res) => {
    const employees = await Employee.find();

    if (!employees)
        return res.status(204).json({ message: "No employees found!" });

    res.json(employees);
};

const createNewEmployee = async (req, res) => {
    if (!req.body?.firstname || !req.body?.lastname)
        return res
            .status(400)
            .json({ message: "First and last names are required!" });

    try {
        const result = await Employee.create({
            firstname: req.body.firstname,
            lastname: req.body.lastname,
        });
        res.status(201).json(result);
    } catch (err) {
        console.log(err);
    }
};

const updateEmployee = async (req, res) => {
    if (!req.body?.id)
        return res.status(400).json({ message: "Id is required!" });

    const employee = await Employee.findOne({ _id: req.body.id }).exec();

    if (!employee)
        return res.status(204).json({ message: `No employees are found!` });

    if (!req.body?.firstname || !req.body?.lastname)
        return res
            .status(400)
            .json({ message: "First and last names are required!" });

    if (req.body?.firstname) employee.firstname = req.body.firstname;
    if (req.body?.lastname) employee.lastname = req.body.lastname;

    const result = await employee.save();

    console.log(result);

    res.json({ message: "Updated Successfully!" });
};

const deleteEmployee = async (req, res) => {
    if (!req.body?.id)
        return res.status(400).json({ message: "Id is required!" });

    const employee = await Employee.findOne({ _id: req.body.id }).exec();

    if (!employee)
        return res.status(204).json({ message: `No employees are found!` });

    const result = await Employee.deleteOne({ _id: req.body.id });

    res.json(result);
};

const getAnEmployee = async (req, res) => {
    console.log(req.body);
    console.log(req.params);
    if (!req.params?.id)
        return res.status(400).json({ message: "Id is required!" });

    const employee = await Employee.findOne({ _id: req.params.id }).exec();

    if (!employee)
        return res.status(204).json({ message: `No employees are found!` });

    res.json(employee);
};

module.exports = {
    getAllEmployees,
    createNewEmployee,
    updateEmployee,
    deleteEmployee,
    getAnEmployee,
};
