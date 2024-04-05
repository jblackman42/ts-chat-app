import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusLarge } from '@fortawesome/pro-regular-svg-icons';

import { requestURL, websocketURL } from '../lib/globals';
import { ServerPopup, Navbar, NavbarLinkProps } from '../components';
type Message = {
  data: any,
  messageType: 'connected-users' | 'server' | 'message'
}
type User = {
  clientIp: string,
  name: string,
  connected: boolean
}
type SafeUser = {
  name: string,
  connected: boolean
}
type ChatMessage = {
  name: string,
  text: string,
  date: Date
}

const getUser = async () => await axios.get(`${requestURL}/auth/user`)
  .then(response => response.data);

function Home() {
  const [user, setUser] = useState<User>();
  const [websocket, setWebsocket] = useState<WebSocket>();
  const navigate = useNavigate();
  const userCheckedRef = useRef(false);
  const [messageInput, setMessageInput] = useState<string>('');
  const [allUsers, setAllUsers] = useState<Array<SafeUser>>([]);
  const [allMessages, setAllMessages] = useState<Array<ChatMessage>>([]);
  const [isServerPopupOpen, setIsServerPopupOpen] = useState<Boolean | null>(null);

  const testLink: NavbarLinkProps = {
    title: 'Add a server',
    onClick: () => setIsServerPopupOpen(true),
    icon: <FontAwesomeIcon icon={faPlusLarge} />
  }

  // const [navbarLinks, setNavbarLinks] = useState<Array<NavbarLinkProps>>([testLink]);
  const navbarLinks: Array<NavbarLinkProps> = [testLink];


  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!user || !websocket) return

    const message: Message = {
      data: {
        name: user.name,
        text: messageInput,
        date: new Date()
      },
      messageType: 'message'
    }

    websocket.send(JSON.stringify(message));
    setMessageInput('');
  }

  const createServer = (serverName: string, serverCode: string): void => {
    console.log(serverName, serverCode);
  }

  useEffect(() => {

    const setupWebSocket = () => {
      const ws = new WebSocket(websocketURL);

      ws.onopen = (): void => {

        ws.onmessage = (e): void => {
          const { data, messageType } = JSON.parse(e.data);
          switch (messageType) {
            case 'connected-users':
              setAllUsers(data);
              break;
            case 'message':
              setAllMessages(msgs => [...msgs, data]);
              break;
            default:
              break;
          }
        }
      }

      setWebsocket(ws);
    }

    if (!userCheckedRef.current) {
      getUser()
        .then(user => {
          if (!user) navigate('/register');
          setUser(user);
          userCheckedRef.current = true; // Mark as checked
          if (user) setupWebSocket(); // Setup WebSocket only if user is found
        })
        .catch(error => console.log(error));
    }
  }, [navigate]); // This effect runs once after the initial render and never again

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

  return (
    <div className="fullscreen-page flex">
      <ServerPopup open={isServerPopupOpen} setOpen={setIsServerPopupOpen} createServer={createServer} />
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
      </div>
    </div>
  );
}

export default Home;