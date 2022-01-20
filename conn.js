const mongoose = require('mongoose');
require('dotenv').config({ path: "./src/config.env" });
const url = process.env.url

mongoose.connect(url, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false

}).then(() => {
    console.log('mongodb is connected');

}).catch((err) => {
    console.log(`no coonection to databse ${err}`);
});
