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
		},
		securityDefinitions: {
			jwt: {
				type: 'apiKey',
				name: 'x-access-token',
				scheme: 'bearer',
				in: 'header',
			},
		},
		security: [{
			jwt: []
		}]
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
/**
 * @swagger
 * /chanels:
 *  post:
 *    description: Create a new Chanel
 *    parameters:
 *      - in: header
 *        name: x-access-token
 *        schema:
 *          type: string
 *      - in: body
 *        name: body contents
 *        description: Chanel name
 *        type: object
 *        properties:
 *          name:
 *            type: string
 *    responses:
 *      200:
 *        description: success response
 *      400:
 *        description: Missing body parameters
*/
app.post('/chanels', auth, async (req, res) => {
	try {
		const { name } = req.body;
		if (name) {
			const newChanel = await Chanels.create({
				id_user: req.user.id,
				name
			});
			const invite_link = req.protocol + "://" + req.get('host') + "/chanel/" + newChanel._id + "/register";
			newChanel.invite_link = invite_link;
			await ChanelUser.create({
				id_chanel: newChanel._id,
				id_user: req.user.id
			});
			res.status(200).json(newChanel);
		} else {
			res.status(400).send('The chanel name is required');
		}
	} catch (err) {
		console.log(err);
	}
});
/**
 * @swagger
 * /chanels/{id}/invite:
 *  get:
 *    description: Gets chanel invite link
 *    parameters:
 *      - in: header
 *        name: x-access-token
 *        schema:
 *          type: string
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: success response
 *      400:
 *        description: bad data request
*/
app.get('/chanels/:id/invite', auth, async (req, res) => {
	try {
		const chanel = await Chanels.findById(req.params.id);
		if (chanel && (chanel.id_user === req.user.id)) {
			const invite_link = req.protocol + "://" + req.get('host') + "/chanel/" + chanel._id + "/register";
			res.json({
				invite_link
			});
		} else {
			res.status(400).send('You cant do this');
		}
	} catch (err) {
		console.log(err);
	}
});
/**
 * @swagger
 * /chanels/{id}/messages:
 *  get:
 *    description: Gets chanel messages
 *    parameters:
 *      - in: header
 *        name: x-access-token
 *        schema:
 *          type: string
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: success response
 *      400:
 *        description: bad data request
*/
app.get('/chanels/:id/messages', auth, async (req, res) => {
	try {
		const partOfChanel = await ChanelUser.findOne({ id_chanel: req.params.id, id_user: req.user.id });
		if (partOfChanel) {
			const messages = await Messages.find({ id_chanel: req.params.id });
			res.json(messages);
		} else {
			res.status(400).send("You cant see this chanel");
		}
	} catch (err) {
		console.log(err);
	}
});
/**
 * @swagger
 * /chanels/{id}/register:
 *  post:
 *    description: Register the logged user to the chanel
 *    parameters:
 *      - in: header
 *        name: x-access-token
 *        schema:
 *          type: string
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: success response
 *      400:
 *        description: bad data request
*/
app.post('/chanels/:id/register', auth, async (req, res) => {
	try {
		const chanel = await Chanels.findById(req.params.id);
		if (chanel) {
			const partOfChanel = await ChanelUser.findOne({ id_chanel: req.params.id, id_user: req.user.id });
			if (!partOfChanel) {
				await ChanelUser.create({
					id_chanel: req.params.id,
					id_user: req.user.id
				});
			}
			res.send('done');
		} else {
			res.status(400).send('Wrong chanel id');
		}
	} catch (err) {
		console.log(err);
	}
});
/**
 * @swagger
 * /chanels/{id}:
 *  post:
 *    description: Creates a new message on the current chanel
 *    parameters:
 *      - in: header
 *        name: x-access-token
 *        schema:
 *          type: string
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *      - in: body
 *        name: body contents
 *        description: Message conten
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *    responses:
 *      200:
 *        description: success response
 *      400:
 *        description: bad data request
*/
app.post('/chanels/:id', auth, async (req, res) => {
	try {
		const { message } = req.body;
		if (message && (message !== "")) {
			const chanel = await Chanels.findById(req.params.id);
			if (chanel) {
				const partOfChanel = await ChanelUser.findOne({ id_chanel: req.params.id, id_user: req.user.id });
				if (partOfChanel) {
					const newMessage = await Messages.create({
						id_chanel: req.params.id,
						id_user: req.user.id,
						message
					});
					res.json(newMessage);
				} else {
					res.status(400).send("You can't do that");
				}
			} else {
				res.status(400).send('Wrong chanel id');
			}
		} else {
			res.status(400).send("You need to sen a message");
		}
	} catch (err) {
		console.log(err);
	}
});
/**
 * @swagger
 * /messages/{id}:
 *  delete:
 *    description: Deletes the message with the id specified
 *    parameters:
 *      - in: header
 *        name: x-access-token
 *        schema:
 *          type: string
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: success response
 *      400:
 *        description: bad data request
*/
app.delete('/messages/:id', auth, async (req, res) => {
	try {
		const message = await Messages.findById(req.params.id);
		if (message) {
			const chanel = await Chanels.findById(message.id_chanel);
			if (message.id_user === req.user.id || chanel.id_user === req.user.id) {
				const deletedMessage = await Messages.findByIdAndDelete(req.params.id);
				res.send('Message deleted');
			} else {
				res.status(400).send('You dont have permissions to delete this message');
			}
		} else {
			res.status(400).send("This message dont exist");
		}
	} catch (err) {
		console.log(err);
	}
});