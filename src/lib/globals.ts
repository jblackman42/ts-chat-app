const requestURL: string = `http://${window.location.hostname}:5000`;
const websocketURL: string = `ws://${window.location.hostname}:5000`
type User = {
  clientIp: string,
  name: string
}

const users: User[] = [];

export {
  requestURL,
  websocketURL,
  users
}