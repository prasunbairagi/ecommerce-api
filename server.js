import http from 'http';
import app from './app/app.js';

//create the server
const PORT = process.env.PORT || 7000
const server = http.createServer(app) // using node core modules,passing the express
server.listen(PORT,console.log(`Server is running on port ${PORT}`))