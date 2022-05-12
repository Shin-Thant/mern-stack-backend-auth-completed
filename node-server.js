const http = require("http");
const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;

const EventEmitter = require("events");
const logEvents = require("./logEvent");

const eventEmitter = new EventEmitter();

eventEmitter.on("log", (msg, fileName) => logEvents(msg, fileName));

const PORT = process.env.PORT || 4000;

const serveFile = async (filePath, contentType, response) => {
    try {
        const rawData = await fsPromises.readFile(
            filePath,
            !contentType.includes("image") ? "utf-8" : ""
        );
        const data =
            contentType === "application/json" ? JSON.parse(rawData) : rawData;
        response.writeHead(filePath.includes("404.html") ? 404 : 200, {
            "Content-Type": contentType,
        });
        response.end(
            contentType === "application/json" ? JSON.stringify(data) : data
        );
    } catch (err) {
        console.log(err);
        eventEmitter.emit("log", `${err.name}\t${err.message}`, "errorLog.txt");
        response.statusCode = 500;
        response.end();
    }
};

const server = http.createServer((req, res) => {
    console.log(`Request URL: ${req.url}`, `\nRequest method: ${req.method}`);

    eventEmitter.emit("log", `${req.url}\t${req.method}`, "reqLog.txt");

    const extension = path.extname(req.url);

    let contentType;

    switch (extension) {
        case ".css":
            contentType = "text/css";
            break;
        case ".js":
            contentType = "text/javascript";
            break;
        case ".json":
            contentType = "application/json";
            break;
        case ".jpg":
            contentType = "image/jpeg";
            break;
        case ".png":
            contentType = "image/png";
            break;
        case ".txt":
            contentType = "text/txt";
            break;
        default:
            contentType = "text/html";
    }

    let filePath =
        contentType === "text/html" && req.url === "/"
            ? path.join(__dirname, "views", "index.html")
            : contentType === "text/html" && req.url.slice(-1) === "/"
            ? path.join(__dirname, "views", req.url, "index.html")
            : contentType === "text/html"
            ? path.join(__dirname, "views", req.url)
            : path.join(__dirname, req.url);

    if (!extension && req.url.slice(-1) !== "/") filePath += ".html";

    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
        // * serve the file
        serveFile(filePath, contentType, res);
    } else {
        // * 404 or 301(redirect)

        switch (path.parse(filePath).base) {
            case "old-page.html": {
                res.writeHead(301, {
                    Location: "/new-page.html",
                });
                res.end();
                break;
            }
            case "www-page.html": {
                res.writeHead(301, {
                    Location: "/",
                });
                res.end();
                break;
            }
            default: {
                // * serve 404 response
                serveFile(
                    path.join(__dirname, "views", "404.html"),
                    "text/html",
                    res
                );
            }
        }
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
