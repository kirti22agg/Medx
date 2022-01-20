const jwt = require('jsonwebtoken');
const Request = require('../connection/Schema');
const cookies = require('cookie-parser');
// const dotenv = require('dotenv');
// dotenv.config({ path: "config.env" });
require('dotenv').config({ path: "src/config.env" });
const key = process.env.KEY;


const auth = async (req, res, next) => {

    try {
        const token = req.cookies.jwt;
        console.log(token)
        const verify = jwt.verify(token, key);
        const user = await Request.findOne({ _id: verify._id });
        req.user = user;
        req.token = token;
        next();
    }
    catch (err) {
        res.status(403).send(err);
    }
}
module.exports = auth;