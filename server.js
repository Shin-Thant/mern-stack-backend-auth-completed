require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const { logger } = require("./middleware/logEvent");
const errorHandler = require("./middleware/errorHandler");
const verifyJWT = require("./middleware/verifyJWT");
const cookieParser = require("cookie-parser");
const credentials = require("./middleware/credentials");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");

const app = express();

const PORT = process.env.PORT || 3500;

connectDB();

// Custom middleware
app.use(logger);

app.use(credentials);

// Corss_Origin_Resource_Sharing
app.use(cors(corsOptions));

// for urlencoded data (form-data)
app.use(express.urlencoded({ extended: false }));

// for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

app.use("/", require("./routes/root"));

app.use("/auth", require("./routes/api/auth"));
app.use("/register", require("./routes/api/register"));
app.use("/refresh", require("./routes/api/refresh"));
app.use("/logout", require("./routes/api/logOut"));

app.use(verifyJWT);

app.use("/employees", require("./routes/api/employees"));
app.use("/users", require("./routes/api/users"));

// * 404 page
// app.all("*", (req, res) => {
//     res.sendStatus(404);

//     if (req.accepts("html")) {
//         res.sendFile("./views/404.html", { root: __dirname });
//     } else if (req.accepts("json")) {
//         res.json({ error: "404 Not Found!" });
//     } else {
//         res.type("txt").send("404 Not Found!");
//     }
// });

app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build/")));

    app.get("*", (req, res) => {
        res.sendFile(
            path.resolve(__dirname, "..", "frontend", "build", "index.html")
        );
    });
} else {
    app.get("/", (req, res) => {
        res.send("API is running ..");
    });
}

mongoose.connection.once("open", () => {
    console.log("connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
