exports.exampleHome = (req, res) => {
    res.render("example/example", {test: "testing123"});
};

exports.exampleCreate = (req, res) => {
    res.send("This is the example create homepage");
}

exports.exampleUpdate = (req, res) => {
    res.send("This is the example update homepage");
}

exports.exampleDelete = (req, res) => {
    res.send("This is the example delete homepage");
}