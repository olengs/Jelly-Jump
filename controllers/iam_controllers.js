exports.authLogin = (req, res) => {
    const {username, password} = req.body;
    console.log(username, password);

    res.send("Hello");
};

exports.authSignup = (req, res) => {
    const {email, username, password, confirmPassword} = req.body;
    console.log(email, username, password, confirmPassword);
    
    res.redirect(302, "/login");
}