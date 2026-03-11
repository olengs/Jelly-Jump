const IAMController = require("./iam_controllers");

exports.loginView = (req, res) => {
    res.render("IAM/login", {});
};

exports.signupView = (req, res) => {
    res.render("IAM/signup", {});
}

exports.login = async (req, res) => {
    const {username, password} = req.body;
    console.log(username, password);

    try {
        let result = await IAMController.checkUserPassword(username, password);
        if (!result) throw new Error("Invalid password");
        // todo: establish session and save cookie on user side to persist session for x duration

        console.log(`Logged in with ${username}, ${password}`);

    } catch (error) {
        // todo: handle & display error to user
        console.log(error);
    }
}

exports.signup = async (req, res) => {
    const {email, username, password, confirmPassword} = req.body;
    console.log(email, username, password, confirmPassword);
    try {
        let user = await IAMController.signupUser(email, username, password, confirmPassword);
        console.log(`user created: ${JSON.stringify(user)}`);
        res.redirect(302, `/login?username=${username}&password=${password}`);
    } catch (error) {
        // todo: display error feedback to user
        console.log(error);
    }
}