const app = require('express')()
const { createServer } = require("http")
const server = createServer(app);
const cors = require("cors");
const fs = require("fs")
const YAML = require("yaml");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express")


const homeRouter = require('./routes/home');
const customErrorHandler = require('./middlewares/customErrorHandler');
//variables
const vOneBaseRoute = "/api/v1"

const file = fs.readFileSync("./swagger.yaml", "utf-8")
const swaggerDocument = YAML.parse(file)
const swaggerOptions = {
    customCss: '.swagger-ui .topbar{display: none}',
    customSiteTitle: 'Chat App'
}
//configs
app.use(cors({
    origin: process.env.CORS_URL
}));
app.use(morgan('tiny'));

// Routes
app.use('/documentation', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions))
app.use("/", homeRouter)

app.use(customErrorHandler);
module.exports = server