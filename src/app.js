const path = require('path');
const dotenv = require('dotenv');
dotenv.config({path: path.resolve(__dirname,"./config/config.env")});

const express = require('express');
const app = express();
const morgan = require('morgan');
const PORT = process.env.PORT || 5050;
const userRouter = require("./routes/userRoutes"); 



app.use(express.json())
app.use(morgan("dev"))

app.get('/', (request, response) => {
    response.json({
        message: "Thanks for the opportunity BiteSpeed!"
    })
})

app.use("/identify", userRouter);

app.listen(PORT, ()=>console.log(`Server is up on port ${PORT}`));
