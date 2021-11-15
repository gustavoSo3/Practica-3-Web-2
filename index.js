const express = require('express');
const app = express();
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const mongoose = require('mongoose');
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
