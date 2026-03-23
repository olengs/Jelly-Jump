class DatabaseNotConnectedError extends Error{
    constructor(){
        super("Database not connected");
        this.statusCode = 500 // status: internal server error
    }
}

class UserAlreadyExistsError extends Error{
    constructor(username){
        super(`username ${username} already exists`);
        this.username = username;
        this.statusCode = 400; //status: bad request
    }
}

class UserNotFoundError extends Error {
    constructor(username) {
        super(`Username ${username} not found`);
        this.username = username;
        this.statusCode = 400; //status: bad request
    }
}

class EmailAlreadyExistsError extends Error {
    constructor(email){
        super(`Email ${email} already exists`);
        this.statusCode = 400; //status: bad request
    }
}

class InvalidPasswordError extends Error {
    constructor(){
        super("Either Password is invalid or user is not found");
        this.statusCode = 400;
    }
}

module.exports = {
    DatabaseNotConnectedError,
    UserAlreadyExistsError,
    UserNotFoundError,
    EmailAlreadyExistsError,
    InvalidPasswordError,
}