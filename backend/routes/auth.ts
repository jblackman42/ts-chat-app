import { users, User, generalServer, ShortServer } from '../../src/lib/globals';

import express, { Request, Response } from 'express';
const router = express.Router();


router.post('/register', (req: Request, res: Response): void => {
  const clientIp = req.headers['x-forwarded-for'] || req.ip;
  const { name } = req.body;

  // Validate input
  if (!clientIp || !name) {
    res.status(500).send("Internal server error");
    return; // Early return to prevent further execution
  }

  // Attempt to find an existing user with the same clientIp  
  const existingUser = users.find(user => user.clientIp === clientIp);

  if (existingUser) {
    // If found, update the existing user's name
    existingUser.name = name;
    res.send(existingUser);
  } else {
    const shortGeneralServer: ShortServer = {
      serverCode: generalServer.serverCode,
      serverName: generalServer.serverName,
      serverIcon: generalServer.serverIcon
    }
    // If no existing user is found, push a new user onto the array
    const newUser: User = { clientIp: clientIp.toString(), name: name, connected: false, connectedServer: null, servers: [shortGeneralServer] };
    users.push(newUser);
    res.send(newUser);
  }
});

router.get('/user', (req: Request, res: Response): void => {
  const clientIp = req.headers['x-forwarded-for'] || req.ip;
  if (!clientIp) {
    res.status(500).send("Internal server error");
    return
  }

  const user = users.find(user => user.clientIp === clientIp);
  res.send(user)
});


module.exports = router;