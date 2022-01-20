const express = require('express');
const app = express();
const hbs = require('hbs');
const path = require('path');
require('../connection/conn');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const Model = require('../connection/Schema');
const auth = require('./auth');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { url } = require('inspector');
require('dotenv').config({ path: "src/config.env" });
const port = process.env.PORT ;

// paths are here !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const path1 = path.join(__dirname, "../templetes/views");
const path2 = path.join(__dirname, "../templetes/partials");
const path3 = path.join(__dirname, "../public");

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path3));
app.set('view engine', "hbs");
app.set('views', path1);
hbs.registerPartials(path2);



app.get('/', (req, res) => {
    res.render('index', { title: "hello" });
});

app.get('/contact', (req, res) => {
    res.render('contact');
})
app.get('/pharmacy', (req, res) => {
    res.render('Pharmacy');
})
app.get('/about', (req, res) => {
    res.render('About');
})
app.get('/terms', (req, res) => {
    res.render('Terms')
})
app.get('/logout', auth, async (req, res) => {
    try {
        res.clearCookie('jwt');
        req.user.tokens = [];
        await req.user.save();
        res.render('Login');
    }
    catch (err) {
        res.send('error')
    }
})
app.get('/login', (req, res) => {
    res.render('Login')
})
app.post('/login', async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const results = await Model.findOne({ email: email });
        const token = await results.generatetoken();
        // token adding here++++++++++++++++++++++++++++++++++++++++++
        // adding cookie!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        console.log(token);

        res.cookie('jwt', token, {
            httpOnly: true,
            expire: new Date(Date.now() + 300000),
        })
        // console.log(req.cookies.jwt + token);
        const compare = await bcrypt.compare(password, results.password);
        console.log(compare);
        if (compare) {
            res.status(201).render('index', { main: "Logout" });
        }
        else {
            res.send(`<h3>SORRY YOU HAVE ENTERED WRONG DATA</h3>`)
        }
    }
    catch (err) {
        res.send(`<h3>Server Is Under Maintenance Try After Some Time</h3>`)
    }

})
app.get('/signup', (req, res) => {
    res.render('Signup');
})
app.post('/signup', async (req, res) => {
    try {
        const emailinput = req.body.email;
        const password = req.body.password;
        const cpass = req.body.cpassword;
        const hashedpass = await bcrypt.hash(password, 10);
        if (password === cpass) {
            console.log("hello")
            console.log(req.body.name);
            const result = new Model({
                name: req.body.name,
                phone: req.body.phone,
                email: req.body.email,
                password: hashedpass
            });
            const token = await result.generatetoken();
            console.log(token);
            const hello = await result.save();
            res.status(201).render("Login", { main: "Logout", Text: "Now You Can Login" });
            console.log(token);
        }

        else {
            res.send(`<h2 class="text-center">Sorry password does not match</h2>`);
        }

    }
    catch (err) {
        res.send(`<h3>Server Is Under Maintenance Try After Some Time</h3>`);
    }

})


app.post('/contact', async (req, res) => {

    const output = `<h3>Message from MEDX contact form</h3>
        <p>Name :${req.body.name}</p>
        <p>Email:${req.body.email}</p>
        <p>Phone:${req.body.phone}</p>
        <p>Message:${req.body.message}</p>`;
    // node mialer startes here
    let transporter = nodemailer.createTransport({
        host: "smtp.hostinger.in",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.User, // generated ethereal user
            pass: process.env.Pass, // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Contact Form Data Contact Page" <lg@lakshaygrover.com>', // sender address
        to: "medx.team.india@gmail.com,lakshaygrover723@gmail.com", // list of receivers
        subject: "Contact Form Data", // Subject line
        text: "Hello world?", // plain text body
        html: output, // html body
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.render('Thank');
})


app.post('/results', async (req, res) => {

    const output = `<h3>Order For MEDX</h3>
    <p>Name :${req.body.name}</p>
    <p>Email:${req.body.email}</p>
    <p>Phone:${req.body.phone}</p>
    <p>Message:${req.body.text}</p>`

    var Storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, './images');
        },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
        }
    })
    var upload = multer({
        storage: Storage
    }).single('image');


    upload(req, res, async function (err) {
        if (err) {
            console.log(err);
            return res.end("Server Error Plez Try Again After Sometime");
        }
        else {
            var name = req.body.name
            var email = req.body.email
            var phone = req.body.phone
            var message = req.body.text
            var Address = req.body.Address
            var hello = req.file.path

            let transporter = nodemailer.createTransport({
                host: "smtp.hostinger.in",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: process.env.User, // generated ethereal user
                    pass: process.env.Pass, // generated ethereal password
                },
                tls: {
                    rejectUnauthorized: false
                }
            });


            let info = await transporter.sendMail({
                from: '"Order For you Guys" <lg@lakshaygrover.com>', // sender address
                to: "medx.team.india@gmail.com,lakshaygrover723@gmail.com", // list of receivers
                subject: "Order", // Subject liner
                text: "Complete This order", // plain text body
                html: `<h2>Name of Person Odering:${name}</h2>
                 <h2>Email:${email}</h2>
                    <h2> Phone:${phone}</h2>
                <h2> Address:${Address}</h2>
                <h2>Medicines to get or Special message:${message}</h2>`, // html body
                attachments: [
                    {
                        path: hello
                    }
                ]
            })
            console.log(hello);
            console.log(req.body);
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            res.render('Thank');
        }
    })
})

app.get('/results', (req, res) => {
    res.render('Results');
})
app.get('/thankyou', (req, res) => {
    res.render('Thank');
})
app.get('/result2', (req, res) => {
    res.render('result2');
})
app.post('/result2', async (req, res) => {

    const output = `<h3>Order For Medx</h3>
        <p>Name :${req.body.name}</p>
        <p>Email:${req.body.email}</p>
        <p>Phone:${req.body.phone}</p>
        <p>Address:${req.body.Address}</p>
        <p>Medicines :${req.body.text}</p>`;
    // node mialer startes here
    let transporter = nodemailer.createTransport({
        host: "smtp.hostinger.in",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.User, // generated ethereal user
            pass: process.env.Pass, // generated ethereal password
        },
        tls: {
            rejectUnauthorized: false
        }
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"MEDX ORDER" <lg@lakshaygrover.com>', // sender address
        to: "medx.team.india@gmail.com,lakshaygrover723@gmail.com", // list of receivers
        subject: "Order For You", // Subject line
        text: "Medx order", // plain text body
        html: output, // html body
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    res.render('Thank');
})



app.listen(port, () => {
    console.log("connection success");
});











