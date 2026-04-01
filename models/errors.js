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
        super(`User ${username} not found`);
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

class EmailFormatError extends Error {
    constructor() {
        super("Email of invalid format");
        this.statusCode = 400;
    }
}

class UsernameFormatError extends Error {
    constructor() {
        super("Username must be between 4 and 12 characters and only letters and numbers are allowed in username");
        this.statusCode = 400;
    }
}

class PasswordFormatError extends Error {
    constructor() {
        super("Passwords must be at least 8 characters and contain at least 1 uppercase, 1 lowercase, 1 digit and 1 special character");
        this.statusCode = 400;
    }
}

class CannotGetFriendsListError extends Error {
    constructor() {
        super("Cannot get friends list");
        this.statusCode = 500; // status: internal server error
    }
}

module.exports = {
    DatabaseNotConnectedError,
    UserAlreadyExistsError,
    UserNotFoundError,
    EmailAlreadyExistsError,
    InvalidPasswordError,
    EmailFormatError,
    UsernameFormatError,
    PasswordFormatError,
    CannotGetFriendsListError
}