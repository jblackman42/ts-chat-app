import { users } from '../lib/globals';

import express, { Request, Response } from 'express';
const router = express.Router();


router.post('/register', (req: Request, res: Response): void => {
  const refererUrl = req.headers.referer;
  const clientIp = req.ip || req.connection.remoteAddress;
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
  } else {
    // If no existing user is found, push a new user onto the array
    const newUser = { clientIp: clientIp, name: name, connected: false };
    users.push(newUser);
  }

  // Redirect or send a status based on the refererUrl
  refererUrl ? res.redirect(refererUrl) : res.sendStatus(200);
});

router.get('/user', (req: Request, res: Response): void => {
  const clientIp = req.ip || req.connection.remoteAddress;
  if (!clientIp) {
    res.status(500).send("Internal server error");
    return
  }

  const user = users.find(user => user.clientIp === clientIp);
  res.send(user)
})

router.get('/users', (req: Request, res: Response): void => {
  res.send(users);
})

module.exports = router;