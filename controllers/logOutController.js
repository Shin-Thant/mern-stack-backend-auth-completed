const User = require("../model/User");

const handleLogOut = async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;

    const foundUser = await User.findOne({ refreshToken }).exec();

    if (!foundUser) {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        return res.sendStatus(403);
    }

    foundUser.refreshToken = foundUser.refreshToken.filter(
        (rt) => rt !== refreshToken
    );
    const result = await foundUser.save();

    console.log(result);

    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        // secure: true,
    });

    res.sendStatus(204);
};

module.exports = { handleLogOut };
