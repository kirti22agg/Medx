const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: "./src/config.env" });

const Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    email: {

        type: String,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("not a valid email");
            }
        }
    },
    phone: {
        type: Number,
        required: true,
        min: 10
    },
    password: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})

Schema.methods.generatetoken = async function () {
    try {

        const token = jwt.sign({ _id: this._id.toString() }, process.env.KEY);
        console.log(token);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    }
    catch (error) {
        console.log(error)
    }

}


const Model = new mongoose.model('Data', Schema);

module.exports = Model;