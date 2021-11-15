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
