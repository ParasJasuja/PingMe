const express = require("express")
const app = express();
const { createServer } = require("http")
const cors = require("cors");
const fs = require("fs")
const YAML = require("yaml");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express")
const { Server } = require("socket.io")
const isLogedinHandshake = require("./middlewares/socketMiddleware")

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_URL,
        credentials: true
    }
})
app.set('io', io)

// Routes
const { socketInIt } = require('./sockets/chat');
const homeRouter = require('./routes/homeRoutes');
const chatRoutes = require("./routes/chatRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

//middlewares
const customErrorHandler = require('./middlewares/customErrorHandler');
const cookieParser = require("cookie-parser");
const { notFound } = require("./controllers/notFoundController");

const file = fs.readFileSync("./swagger.yaml", "utf-8")
const swaggerDocument = YAML.parse(file)
const swaggerOptions = {
    customCss: '.swagger-ui .topbar{display: none}',
    customSiteTitle: 'Chat App'
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE_SECRET))

app.use(cors({
    origin: process.env.CORS_URL
}));
app.use(morgan('tiny'));


//Routes
//Documentation
app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions))
//Home
app.use("/", homeRouter)
//User
app.use("/v1", userRoutes)
//Chat
app.use("/v1/chat", chatRoutes)
//Message
app.use("/v1/message", messageRoutes)







//Not Found
app.use(notFound)

socketInIt(io)





app.use(customErrorHandler);
module.exports = server