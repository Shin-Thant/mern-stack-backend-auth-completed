const obj = {
    data: "hello world",
};

const test = {
    d: true,
};

function check() {
    if (!obj?.sent) {
        console.log(obj.data);
        obj.sent = true;

        return obj;
    }

    console.log("not sent");
    return "error";
}

// check();
// check();
