import { Server as HttpServer, IncomingMessage } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { User, users } from './globals';

// Map to associate WebSockets with client IPs
const clientMap = new Map<WebSocket, string>();
type Message = {
  data: any,
  messageType: 'connected-users' | 'server' | 'message'
}
type ChatMessage = {
  name: string,
  text: string,
  date: Date
}
const allMessages: Array<ChatMessage> = [];

function broadcast(msg: Message) {
  clientMap.forEach((_, ws) => {
    ws.send(JSON.stringify(msg));
  })
}

function updateClients(): void {
  const userNamesArray = users.filter(user => user.connected).map(user => user.name);
  const message: Message = {
    data: userNamesArray,
    messageType: 'connected-users'
  }
  broadcast(message);
}

function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientIp = req.socket.remoteAddress || '';

    // Find user by IP and mark as connected
    const user = users.find((user: User) => user.clientIp === clientIp);
    if (user) {
      user.connected = true;
      // console.log('New client connected:', user.name);
      // Associate this WebSocket connection with the user's IP
      clientMap.set(ws, clientIp);
      updateClients();

      allMessages.forEach(message => ws.send(JSON.stringify(message)));
    }

    ws.on('message', (message: WebSocket.Data) => {
      const messageData = JSON.parse(message.toString());
      switch (messageData.messageType) {
        case 'message':
          allMessages.push(messageData);
          broadcast(messageData);
          break;

        default:
          break;
      }
    });

    ws.on('close', () => {
      // Use the map to get the client IP associated with this WebSocket
      const ip = clientMap.get(ws);
      if (ip) {
        // Find the user again (or use a more efficient way if available)
        const user = users.find((user: User) => user.clientIp === ip);
        if (user) {
          user.connected = false;
          // console.log(`${user.name} has disconnected.`);
        }
        // Remove the entry from the map
        clientMap.delete(ws);
        updateClients();
      }
    });
  });
}

export { setupWebSocket };