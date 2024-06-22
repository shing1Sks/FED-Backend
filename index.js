require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require('./middleware/errorHandler');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(cookieParser());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Routes
app.use('/api', require('./routes/api'));

// Error-handling middleware -> List it at the end
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server listening to PORT -> ${PORT}`);
});

console.log("Hii this is the new backend");
