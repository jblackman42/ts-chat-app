import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { all } from 'axios';

import { requestURL, websocketURL } from '../lib/globals';

type Message = {
  data: any,
  messageType: 'connected-users' | 'server' | 'message'
}
type User = {
  clientIp: string,
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
  const [connectedUsers, setConnectedUsers] = useState<Array<string>>([])
  const [allMessages, setAllMessages] = useState<Array<ChatMessage>>([])


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

  useEffect(() => {
    const setupWebSocket = () => {
      const ws = new WebSocket(websocketURL);

      ws.onopen = (): void => {

        ws.onmessage = (e): void => {
          const { data, messageType } = JSON.parse(e.data);
          switch (messageType) {
            case 'connected-users':
              setConnectedUsers(data);
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

  return (
    <div className="fullscreen-page flex">
      <div className="online-users-container">
        <ul className="online-users">
          <h1>Online Users</h1>
          {connectedUsers.map((name, i) => <li key={i}>{name}</li>)}
        </ul>
      </div>
      <div className="group-chat-container">
        <div id="message-container">
          {allMessages.map((message, i) => {
            const lastMessage = allMessages[i - 1];
            const { name, text, date } = message;
            const dateVal = new Date(date);
            const dateString = `${dateVal.toLocaleDateString()} ${dateVal.toLocaleTimeString('en-us', { hour: 'numeric', minute: 'numeric' })}`
            return <div className={`message ${name === user?.name ? 'internal' : ''}`} key={i}>
              {lastMessage?.name !== name || new Date(date).getTime() - new Date(lastMessage?.date).getTime() > (1000 * 60) ? <p className="name">{name}<span className="date"> • {dateString}</span> </p> : ''}
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
          />
          <button type="submit" id="form-submit" disabled={!Boolean(messageInput)}>
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Home;