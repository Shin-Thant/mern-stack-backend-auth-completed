const User = require("../model/User");
const bcrypt = require("bcrypt");

// * Notice that this function is a asynchronous function!
const handleNewUser = async (req, res) => {
    const { user, pwd } = req.body;

    console.log(user, pwd);

    if (!user || !pwd)
        return res
            .status(400)
            .json({ message: "Username and password are required!" });

    // check for duplicate user in db
    const duplicate = await User.findOne({ username: user }).exec();

    if (duplicate) return res.sendStatus(409);

    try {
        // encrypt the password
        const hashedPwd = await bcrypt.hash(pwd, 10);

        const result = await User.create({
            username: user,
            roles: {
                User: 2001,
            },
            password: hashedPwd,
        });

        console.log(result);

        res.status(201).json({ success: `New user ${user} created.` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { handleNewUser };
