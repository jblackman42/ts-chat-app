import { faUserGroup } from "@fortawesome/pro-regular-svg-icons";
import { IconDefinition } from "@fortawesome/pro-regular-svg-icons";

const requestURL: string = process.env.NODE_ENV !== 'production' ? `http://localhost:5000` : '';

type ChatMessage = {
  name: string,
  text: string,
  date: Date,
  serverCode: string | null
}
type Server = {
  serverName: string,
  serverCode: string,
  serverIcon: IconDefinition,
  messages: ChatMessage[]
}
type ShortServer = {
  serverName: string,
  serverCode: string,
  serverIcon: IconDefinition
}
type User = {
  clientIp: string,
  name: string,
  connected: boolean,
  connectedServer: string | null,
  servers: ShortServer[]
}
const users: User[] = [];
const generalServerCode: string = '';
const generalServer: Server = {
  serverCode: generalServerCode,
  serverName: 'General',
  serverIcon: faUserGroup,
  messages: []
}

export {
  requestURL,
  users,
  generalServer
}
export type {
  User,
  Server,
  ShortServer,

}