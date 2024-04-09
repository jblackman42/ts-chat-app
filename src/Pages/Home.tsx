import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusLarge, faArrowRightToArc, faClipboard, faCheck } from '@fortawesome/pro-regular-svg-icons';
import { IconDefinition } from "@fortawesome/pro-regular-svg-icons";

import { CreateServerPopup, JoinServerPopup, Navbar, NavbarLinkProps } from '../components';
type Message = {
  data: any,
  messageType: 'update-users' | 'message' | 'create-server' | 'join-server' | 'verify-server' | 'invalid-server' | 'change-server'
}
type SafeUser = {
  name: string,
  connected: boolean
}
type ChatMessage = {
  name: string,
  text: string,
  date: Date,
  serverCode: string | null
}
type Server = {
  serverName: string,
  serverCode: string,
  serverIcon: IconDefinition
}
type User = {
  clientIp: string,
  name: string,
  connected: boolean,
  servers: Array<Server>
}

const requestURL: string = process.env.NODE_ENV !== 'production' ? `http://localhost:5000` : '';

const getUser = async () => await axios.get(`${requestURL}/auth/user`)
  .then(response => response.data);

function Home() {
  const { serverCode } = useParams();

  const [user, setUser] = useState<User>();
  const [websocket, setWebsocket] = useState<WebSocket>();
  const navigate = useNavigate();
  const userCheckedRef = useRef(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [allUsers, setAllUsers] = useState<Array<SafeUser>>([]);
  const [isCreateServerPopupOpen, setIsCreateServerPopupOpen] = useState<Boolean | null>(null);
  const [isJoinServerPopupOpen, setIsJoinServerPopupOpen] = useState<Boolean | null>(null);
  const [currentServer, setCurrentServer] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<Array<ChatMessage>>([]);
  const [isCodeCoppied, setisCodeCoppied] = useState<Boolean>(false);

  const createServerNavBtn: NavbarLinkProps = {
    title: 'Add a server',
    onClick: () => setIsCreateServerPopupOpen(true),
    icon: <FontAwesomeIcon icon={faPlusLarge} />
  }
  const joinServerNavBtn: NavbarLinkProps = {
    title: 'Join a server',
    onClick: () => setIsJoinServerPopupOpen(true),
    icon: <FontAwesomeIcon icon={faArrowRightToArc} />
  }

  const constNavLinks: NavbarLinkProps[] = [createServerNavBtn, joinServerNavBtn];
  const [customNavbarLinks, setCustomNavbarLinks] = useState<Array<NavbarLinkProps>>([]);
  const navbarLinks = [...customNavbarLinks, ...constNavLinks];

  useEffect(() => {
    if (!user || !websocket) return;
    setCurrentServer(serverCode ?? '');
    setAllMessages([]);

    const message: Message = {
      data: serverCode,
      messageType: serverCode && !user.servers.find(server => server.serverCode === serverCode) ? 'join-server' : 'change-server'
    }
    websocket.send(JSON.stringify(message));
  }, [user, websocket, serverCode]);

  useEffect(() => {
    const initialize = (ws: WebSocket, user: User): void => {
      user.servers.forEach(server => addServerToNav(server));

      ws.onmessage = (e): void => {
        const { data, messageType } = JSON.parse(e.data);
        switch (messageType) {
          case 'update-users':

            setAllUsers(data);
            break;
          case 'message':
            setAllMessages(msgs => [...msgs, data]);
            break;
          case 'invalid-server':
            navigate('/');
            break;
          case 'join-server':
            user.servers.push(data);
            addServerToNav(data);
            setAllMessages(data.messages);
            break;
          case 'change-server':
            setAllMessages(data.messages);
            break;
          default:
            break;
        }
      }

      setUser(user);
      setWebsocket(ws);
    }

    const createWebSocket = (user: User) => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsURL = process.env.NODE_ENV === 'production' ? `${wsProtocol}//${window.location.host}` : `${wsProtocol}//${window.location.hostname}:5000`;
      const ws = new WebSocket(wsURL);
      const keepAlive = () => {
        const timeout = 10000;
        if (ws.readyState === ws.OPEN) {
          // console.log('ping');
          ws.send('')
        };
        setTimeout(keepAlive, timeout);
      }
      ws.onopen = () => {
        initialize(ws, user);
        keepAlive();
      }
    }

    if (!userCheckedRef.current) {
      getUser()
        .then(user => {
          if (!user) navigate('/register');
          userCheckedRef.current = true; // Mark as checked
          if (user) {
            createWebSocket(user);
          } // Setup WebSocket only if user is found
        })
        .catch(error => console.log(error));
    }
  }, [navigate]);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!user || !websocket) return
    const chatMsg: ChatMessage = {
      name: user.name,
      text: messageInput,
      date: new Date(),
      serverCode: currentServer
    }

    const message: Message = {
      data: chatMsg,
      messageType: 'message'
    }

    websocket.send(JSON.stringify(message));
    setMessageInput('');
  }

  const addServerToNav = (serverData: Server): void => {
    const { serverName, serverCode, serverIcon } = serverData;
    const serverNavbarLink: NavbarLinkProps = {
      title: serverName,
      to: `/${serverCode}`,
      icon: <FontAwesomeIcon icon={serverIcon} />
    }
    setCustomNavbarLinks(links => [...links, serverNavbarLink]);
  }

  const createServer = (serverName: string, serverCode: string, serverIcon: IconDefinition): void => {
    if (!websocket || !user) return;
    const server: Server = {
      serverName: serverName,
      serverCode: serverCode,
      serverIcon: serverIcon
    };
    const message: Message = {
      data: server,
      messageType: 'create-server'
    };
    websocket.send(JSON.stringify(message));
    user.servers.push(server);
    navigate(`/${serverCode}`);
  }

  useEffect(() => {
    const autoScroll = () => {
      const msgContainer = document.getElementById('message-container');
      if (msgContainer) {
        // Ensure scrolling to the bottom
        msgContainer.scrollTop = msgContainer.scrollHeight;
      }
    }
    autoScroll();
  }, [allMessages]);

  const copyCodeToClipboard = async () => {
    if (!serverCode) return;
    try {
      await navigator.clipboard.writeText(serverCode);
      setisCodeCoppied(true);
      // Optionally reset the icon back to clipboard after a delay
      setTimeout(() => setisCodeCoppied(false), 2000); // Reset icon after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Handle the error (maybe set an error state or log this)
    }
  }

  return (
    <div className="fullscreen-page flex">
      <CreateServerPopup open={isCreateServerPopupOpen} setOpen={setIsCreateServerPopupOpen} createServer={createServer} />
      <JoinServerPopup open={isJoinServerPopupOpen} setOpen={setIsJoinServerPopupOpen} joinServer={(code: string) => navigate(code)} />
      <Navbar links={navbarLinks} />
      <div className="group-chat-container">
        <div id="message-container">
          {allMessages.map((message, i) => {
            const lastMessage = allMessages[i - 1];
            const { name, text, date } = message;
            const dateVal = new Date(date);
            const dateString = `${dateVal.toLocaleDateString()} ${dateVal.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' })}`
            return <div className="message" key={i}>
              {lastMessage?.name !== name || new Date(date).getTime() - new Date(lastMessage?.date).getTime() > (1000 * 60) ? <p className="name">{name}<span className="date">{dateString}</span> </p> : ''}
              <p className="text">{text}</p>
            </div>
          })}
        </div>

        <form id="input-form" onSubmit={handleFormSubmit}>
          <input
            type="text"
            id="message-input"
            onInput={(e) => setMessageInput((e.target as HTMLInputElement).value)}
            value={messageInput}
            placeholder='Send a message'
          />
          <button type="submit" id="form-submit" disabled={!Boolean(messageInput)}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
      </div>

      <div className="users-container">
        <ul className="users">
          <p className="label">online - {allUsers.filter(user => user.connected).length}</p>
          {allUsers.filter(user => user.connected).map((user, i) => <li key={i}>{user.name}</li>)}
          <p className="label">offline - {allUsers.filter(user => !user.connected).length}</p>
          {allUsers.filter(user => !user.connected).map((user, i) => <li key={i} className="offline">{user.name}</li>)}
        </ul>
        {serverCode && <div id="server-invite-container">
          <label className="input-label">Server Code</label>
          <div className="input-container">
            <input type="text" value={serverCode} readOnly />
            <button id="copy-code" type="button" onClick={(e) => { e.preventDefault(); copyCodeToClipboard(); }} data-copy-msg={isCodeCoppied ? 'Copied!' : null}>
              <FontAwesomeIcon icon={isCodeCoppied ? faCheck : faClipboard} />
            </button>
          </div>
        </div>}
      </div>
    </div>
  );
}

export default Home;