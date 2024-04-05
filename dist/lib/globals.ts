type User = {
  clientIp: string,
  name: string,
  connected: boolean
}
const users: User[] = [];

export {
  User,
  users
}