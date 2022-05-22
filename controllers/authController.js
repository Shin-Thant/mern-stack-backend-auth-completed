const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogin = async (req, res) => {
    // * We accept the cookies.
    const cookies = req.cookies;

    console.log(cookies?.jwt);

    const { user, pwd } = req.body;

    if (!user || !pwd)
        return res
            .status(400)
            .json({ message: "Username and password are required!" });

    const foundUser = await User.findOne({ username: user }).exec();

    if (!foundUser) return res.status(403).json({ message: "user not found" });

    const match = await bcrypt.compare(pwd, foundUser.password);

    if (match) {
        const roles = Object.values(foundUser.roles).filter(Boolean);

        const accessToken = await jwt.sign(
            {
                UserInfo: {
                    username: foundUser.username,
                    roles: roles,
                },
            },
            process.env.ACCESS_TOKEN_KEY,
            {
                expiresIn: "30s",
            }
        );

        const newRefreshToken = await jwt.sign(
            { username: foundUser.username },
            process.env.REFRESH_TOKEN_KEY,
            {
                expiresIn: "35s",
            }
        );

        // * Then check the cookie called jwt exists. If it exists, which means user didn't log out and access token expired and so new access token and refresh token have to be created. So we remove the refresh token from cookie in the founduser's refresh token.

        // * If cookie don't exist, that means user log out and refresh token already had been removed from database. So we just add the refresh token from foundUser.

        let newRefreshTokenArray = !cookies?.jwt
            ? foundUser.refreshToken
            : foundUser.refreshToken.filter((rt) => rt !== cookies.jwt);

        // * Then if jwt cookie exist we delete the cookie to create new cookie with new refresh token
        if (cookies?.jwt) {
            console.log("cookie exists");

            console.log(cookies?.jwt);

            const refreshToken = cookies.jwt;

            const foundToken = await User.findOne({ refreshToken }).exec();

            if (!foundToken) {
                console.log("attempted refresh token resuse at login");
                newRefreshTokenArray = [];
            }

            res.clearCookie("jwt", {
                httpOnly: true,
                sameSite: "None",
                secure: true,
            });
        }

        // * Saving refresh token with current user
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        const result = await foundUser.save();

        console.log(result);

        // * you have to add 'secure: ture' in production. i commented it because thunder-client won't work when i didn't comment it
        res.cookie("jwt", newRefreshToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        console.log(
            "===================================================================================="
        );

        res.json({
            roles,
            accessToken,
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = { handleLogin };
