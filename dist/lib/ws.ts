import { Server as HttpServer, IncomingMessage } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';
import { ShortServer, Server, users, generalServer } from './globals';

// Map to associate WebSockets with client IPs
type Message = {
  data: any,
  messageType: 'update-users' | 'message' | 'create-server' | 'join-server' | 'verify-server' | 'invalid-server' | 'change-server'
}
const clientMap = new Map<WebSocket, string>(); // (ws, ip;)
const serverMap = new Map<string, Server>(); // (code, name)
// const allMessages: Array<ChatMessage> = [];

serverMap.set(generalServer.serverCode, generalServer);

function broadcast(serverCode: string, msg: Message) {
  clientMap.forEach((clientIp, ws) => {
    const user = users.find(user => user.clientIp === clientIp);
    if (ws.readyState === WebSocket.OPEN && user && user.servers.find(server => server.serverCode === serverCode)) {
      ws.send(JSON.stringify(msg));
    }
  });
}

function updateUserList(serverCode: string): void {
  const safeUsersArray = users
    .filter(user => user.servers.find(server => server.serverCode === serverCode))
    .map(user => { return { name: user.name, connected: user.connected } });
  const message: Message = {
    data: safeUsersArray,
    messageType: 'update-users'
  }
  broadcast(serverCode, message);
}

function addServerToUser(clientIp: string, serverCode: string): void {
  const user = users.find(u => u.clientIp === clientIp);
  const server = serverMap.get(serverCode);
  if (!user || !server) return;
  const shortServer: ShortServer = {
    serverCode: server.serverCode,
    serverName: server.serverName,
    serverIcon: server.serverIcon
  }

  user.servers.push(shortServer);
  user.connectedServer = serverCode;
}

function setupWebSocket(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const clientIp = req.socket.remoteAddress || '';
    clientMap.set(ws, clientIp);

    const user = users.find(user => user.clientIp === clientIp);
    if (user) {
      user.connected = true;

      updateUserList('');
      // allMessages.forEach(message => ws.send(JSON.stringify(message)));
    }

    ws.on('message', (message: WebSocket.Data) => {
      const messageData = JSON.parse(message.toString());
      const { data, messageType } = messageData;
      switch (messageType) {
        case 'message': {
          const { serverCode } = data;
          const server = serverMap.get(serverCode);
          if (!server) return;
          server.messages.push(data);

          // allMessages.push(messageData);
          broadcast(serverCode, messageData);
          break;
        }
        case 'create-server': {
          const { serverName, serverCode, serverIcon } = data;
          const server: Server = {
            serverCode: serverCode,
            serverName: serverName,
            serverIcon: serverIcon,
            messages: []
          }
          serverMap.set(serverCode, server);
          addServerToUser(clientIp, serverCode);
          const message: Message = {
            data: server,
            messageType: 'join-server'
          };
          ws.send(JSON.stringify(message));
          break;
        }
        case 'join-server': {
          const serverCode = data;
          const server = serverMap.get(serverCode);
          if (!server) {
            const message: Message = {
              data: null,
              messageType: 'invalid-server'
            }
            ws.send(JSON.stringify(message));
            break;
          }
          addServerToUser(clientIp, serverCode);
          const message: Message = {
            data: server,
            messageType: 'join-server'
          }
          updateUserList(serverCode);
          ws.send(JSON.stringify(message));
          break;
        }
        case 'change-server': {
          const serverCode = data ?? '';
          const server = serverMap.get(serverCode);
          const user = users.find(u => u.clientIp === clientIp);
          if (!user || !server) break;
          user.connectedServer = serverCode;
          updateUserList(serverCode);
          const message: Message = {
            data: server,
            messageType: 'change-server'
          }
          ws.send(JSON.stringify(message));
          break;
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
        user.servers.forEach(server => updateUserList(server.serverCode));
        // updateUserList();
        // updateClients();
      }
      clientMap.delete(ws);
    });
  });
}

export { setupWebSocket };