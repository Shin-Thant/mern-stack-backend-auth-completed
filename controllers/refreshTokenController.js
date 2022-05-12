const User = require("../model/User");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    console.log(cookies?.jwt);

    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });

    // * We find a user with refresh token which is from cookie. So, if we don't find the user that means this is not user. Because we don't find the user with this refresh token.

    // * What we gonna do is we are gonna delete the refresh token and create a new one whenever user tries to get new access token.

    const foundUser = await User.findOne({ refreshToken }).exec();

    // * Refresh Token reuse detection
    if (!foundUser) {
        // * So if we didn't find the user, we verify the refresh token and get the decoded payload from callback
        // * and then find the user from database with this username.
        // * next we delete the refresh token from that user.

        // * if we have an error from callback, then it means refresh token has been invalidated.

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_KEY,
            async (err, decoded) => {
                if (err) return res.sendStatus(403);

                const hackedUser = await User.findOne({
                    username: decoded.username,
                }).exec();
                hackedUser.refreshToken = [];

                const result = await hackedUser.save();
                console.log(result);
            }
        );

        return res.sendStatus(403); // Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(
        (rt) => rt !== refreshToken
    );

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_KEY,
        async (err, decoded) => {
            if (err) {
                console.log("it expired");
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
            }

            if (err || foundUser.username !== decoded.username)
                return res.sendStatus(403);

            const roles = Object.values(foundUser.roles);

            const accessToken = jwt.sign(
                {
                    UserInfo: {
                        username: decoded.username,
                        roles,
                    },
                },
                process.env.ACCESS_TOKEN_KEY,
                { expiresIn: "30s" }
            );

            const newRefreshToken = await jwt.sign(
                { username: foundUser.username },
                process.env.REFRESH_TOKEN_KEY,
                {
                    expiresIn: "35s",
                }
            );

            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await foundUser.save();

            // create new secure cookie
            res.cookie("jwt", newRefreshToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });

            console.log(
                "======================================================================================="
            );

            res.json({ roles, accessToken });
        }
    );
};

module.exports = { handleRefreshToken };
