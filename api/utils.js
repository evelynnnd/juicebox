function requireUser(req, res, next) {
    //if req.user isn't set then end error.
    if (!req.user) {
        next({
            name: "MissingUserError",
            message: "Ypu must be logged in to perform this action"
        })
    }
    //otherwise continue
    next();
};

module.exports = { requireUser }