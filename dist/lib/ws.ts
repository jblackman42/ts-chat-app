import { Server as HttpServer, IncomingMessage } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { User, Server, users } from './globals';

// Map to associate WebSockets with client IPs
type Message = {
  data: any,
  messageType: 'connected-users' | 'message' | 'create-server' | 'join-server' | 'verify-server' | 'invalid-server'
}
type ChatMessage = {
  name: string,
  text: string,
  date: Date,
  server: Server | null
}
const clientMap = new Map<WebSocket, string>(); // (ws, ip;)
const serverMap = new Map<string, string>(); // (code, name)
const allMessages: Array<ChatMessage> = [];

function broadcast(msg: Message) {
  console.log(msg.data.server);
  clientMap.forEach((clientIp, ws) => {
    const user = users.find(user => user.clientIp === clientIp);
    if (ws.readyState === WebSocket.OPEN && user && user.servers.find(server => server.serverCode === msg.data.server.serverCode)) {
      ws.send(JSON.stringify(msg));
    }
  });
}

function updateClients(): void {
  const safeUsersArray = users.map(user => { return { name: user.name, connected: user.connected } });
  const message: Message = {
    data: safeUsersArray,
    messageType: 'connected-users'
  }
  broadcast(message);
}

function addServerToUser(clientIp: string, serverCode: string): void {
  const user = users.find(u => u.clientIp === clientIp);
  const serverName = serverMap.get(serverCode);
  if (!user || !serverName) return;
  const existingServer = user.servers.find(server => server.serverCode === serverCode);
  if (existingServer) return;

  const server: Server = {
    serverName: serverName,
    serverCode: serverCode
  };
  user.servers.push(server);
}

function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientIp = req.socket.remoteAddress || '';
    clientMap.set(ws, clientIp);

    const user = users.find(user => user.clientIp === clientIp);
    if (user) {
      user.connected = true;
      allMessages.forEach(message => ws.send(JSON.stringify(message)));
    }

    ws.on('message', (message: WebSocket.Data) => {
      const messageData = JSON.parse(message.toString());
      const { data, messageType } = messageData;
      switch (messageType) {
        case 'message': {
          allMessages.push(messageData);
          broadcast(messageData);
          break;
        }
        case 'create-server': {
          const { serverName, serverCode } = data;
          serverMap.set(serverCode, serverName);
          const message: Message = {
            data: data,
            messageType: 'join-server'
          };
          ws.send(JSON.stringify(message));
          break;
        }
        case 'verify-server': {
          const { serverCode } = data;
          const serverName = serverMap.get(serverCode);
          const message: Message = {
            data: serverCode ? { serverName, serverCode } : null,
            messageType: serverName ? 'join-server' : 'invalid-server'
          }
          ws.send(JSON.stringify(message));
          break;
        }
        case 'join-server': {
          const { serverCode } = data;
          addServerToUser(clientIp, serverCode);
        }
        default:
          break;
      }
    });

    ws.on('close', () => {
      const clientIp = clientMap.get(ws);
      const user = users.find(u => u.clientIp === clientIp);
      if (user) {
        user.connected = false;
        // updateClients();
      }
      clientMap.delete(ws);
    });
  });
}

export { setupWebSocket };