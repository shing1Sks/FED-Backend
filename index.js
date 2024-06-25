require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require('./middleware/errorHandler');
const logRequestBody = require('./middleware/requestLog');
const { sendMail } = require('./utils/nodeMailer');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));


// Log the request
console.log("LOG mode enabled :",process.env.LOG_REQ)
if (process.env.LOG_REQ === "true") {
    app.use(logRequestBody);
}

// Routes
app.use('/api', require('./routes/api/index'));


// Error-handling middleware -> List it at the end
app.use(errorHandler);

app.post('/mail', (req, res)=>{
    const {email, subject, content} = req.body;
    sendMail(email, subject, content);
    res.json("Email sent successfully!")
})

app.listen(PORT, () => {
    console.log(`FED-Backend listening to PORT -> ${PORT}`);
});


// ...../api/user/update