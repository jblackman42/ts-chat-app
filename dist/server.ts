import express from 'express';
import http from 'http';
import cors from 'cors';
import { setupWebSocket } from './lib/ws';

const app = express();
const server = http.createServer(app);

// setup functions
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/auth', require('./routes/auth'));

setupWebSocket(server);
// Start the server
const port = process.env.PORT || 5000;
(async () => {
  try {
    server.listen(port, () => console.log(`Server is listening on port ${port} - http://localhost:${port}`));
  } catch (error) { console.log(error) }
})();