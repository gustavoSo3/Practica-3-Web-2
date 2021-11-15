const express = require('express');
const app = express();
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const auth = require('./src/middlewares/auth');

const mongoose = require('mongoose');
const Users = require('./src/models/Users');
const Chanels = require('./src/models/Chanels');
const ChanelUser = require('./src/models/ChanelUser');
const Messages = require('./src/models/Messages');

require('dotenv').config();
const port = process.env.PORT || 1607;
//Swagger
const swaggerOptions = {
	swaggerDefinition: {
		swagger: "2.0",
		info: {
			title: "Tequila chat API Swagger UI",
			description: "Api documentation for tequila chat, using swagger",
			version: "1.0.0",
			servers: ['http://localhost:' + port],
			contact: {
				name: "GSO3",
				correo: "gustavonline.games@gmail.com"
			}
		}
	},
	apis: ['index.js']
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/swagger-ui', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db_url = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_CLUSTER + ".9t5g5.mongodb.net/" + process.env.DB_COLLECTION + "?retryWrites=true&w=majority"
mongoose.connect(db_url, { useNewUrlParser: true, useUnifiedTopology: true })
	.then((result) => {
		console.log('Conected to database');
		app.listen(port, () => {
			console.log('App iniciada en http://localhost:' + port);
			console.log('Swagger docs en http://localhost:' + port + "/swagger-ui");
		});
	}).catch((err) => {
		console.log(err, 'Error al conectarse a la base de datos');
		process.exit(1);
	});


/**
 * @swagger
 * /register:
 *  post:
 *    description: Create a new user
 *    parameters:
 *      - in: body
 *        name: body contents
 *        description: User email, name and password
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *          email:
 *            type: string
 *          password:
 *            type: string
 *    responses:
 *      200:
 *        description: Created and logged in
 *      409:
 *        description: Email on use
 *      400:
 *        description: Body parameters missing
*/
app.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!(name && email && password)) {
			res.status(400).send("Body parameters missing");
		}
		const userExist = await Users.findOne({ email });
		if (userExist) {
			res.status(409).send("Email on use");
		} else {

			const encryptedPassword = await bcrypt.hash(password, 10);
			const newUser = await Users.create({
				name,
				email: email.toLowerCase(),
				password: encryptedPassword
			});

			const token = await jwt.sign({
				id: newUser._id, email
			}, process.env.TOKEN_KEY);
			newUser.token = token;
			res.status(201).json(newUser);
		}
	} catch (err) {
		console.log(err);
	}
});

/**
 * @swagger
 * /login:
 *  post:
 *    description: Login with credentials
 *    parameters:
 *      - in: body
 *        name: body contents
 *        description: User email and password
 *        type: object
 *        properties:
 *          email:
 *            type: string
 *          password:
 *            type: string
 *    responses:
 *      200:
 *        description: success response
 *      400:
 *        description: Missing body parameters
*/
app.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		if (!(email && password)) {
			res.status(400).send("Missing body parameters");
		}
		const checkUser = await Users.findOne({ email });
		if (checkUser && (await bcrypt.compare(password, checkUser.password))) {
			const token = jwt.sign({
				id: checkUser._id, email
			}, process.env.TOKEN_KEY);
			checkUser.token = token;
			res.status(200).json(checkUser);
		} else {
			res.status(400).send("Bad credentials");
		}
	} catch (err) {
		console.log(err);
	}
});
