type Server = {
  serverName: string,
  serverCode: string
}
type User = {
  clientIp: string,
  name: string,
  connected: boolean,
  servers: Array<Server>
}
const users: User[] = [];

export {
  User,
  Server,
  users
}