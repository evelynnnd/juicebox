const PORT = 3000;
const express = require('express');
const morgan = require('morgan');
const server = express();
const apiRouter = require('./api');

const { client } = require('./db')

server.use(morgan('dev'));
server.use(express.json());
server.use('/api', apiRouter);

client.connect();

//starting server 
server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
});
