const User = require("../model/User");

const getAllUsers = async (req, res) => {
    const result = await User.find();

    res.json(result);
};

const updateUser = async (req, res) => {
    if (!req.body?.id)
        return res.status(400).json({ message: "Id is required!" });

    const foundUser = await User.findOne({ _id: req.body.id }).exec();

    if (!foundUser)
        return res
            .status(409)
            .json({ message: `There is no user with ${req.body.id}` });

    if (!req.body?.username)
        return res.status(400).json({ message: `New username is required!` });

    console.log(req.body.username);

    foundUser.username = req.body.username;
    const result = await foundUser.save();
    console.log(result);

    res.json(result);
};

const deleteUser = async (req, res) => {
    if (!req.body?.id)
        return res.status(400).json({ message: "Id is required!" });

    const foundUser = await User.findOne({ _id: req.body.id }).exec();

    if (!foundUser)
        return res
            .status(409)
            .json({ message: `There is no user with ${req.body.id}` });

    const result = await User.deleteOne({ _id: req.body.id });
    console.log(result);

    res.json(result);
};

const getOneUser = async (req, res) => {
    if (!req.params?.id)
        return res.status(400).json({ message: "Id is required!" });

    const result = await User.findOne({ _id: req.params.id }).exec();
    console.log(result);

    if (!result) return res.status(204).json({ message: "User not found!" });

    res.json(result);
};

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
    getOneUser,
};
