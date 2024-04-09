import path from 'path';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { setupWebSocket } from './routes/ws';

const app = express();
const server = http.createServer(app);

// setup functions
require('dotenv').config();
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(bodyParser.json());

// Assuming the 'build' folder is in the same directory as your server.ts file
const root = path.join(__dirname, '../build');
app.use(express.static(root));

app.use('/auth', require('./routes/auth'));

// Ensure that the static files are served first
app.get('/*', (req, res) => {
  res.sendFile('index.html', { root });
});

// Start the server
const port = process.env.PORT || 5000;
(async () => {
  try {
    setupWebSocket(server);
    server.listen(port, () => console.log(`Server is listening on port ${port} - http://localhost:${port}`));
  } catch (error) { console.log(error) }
})();