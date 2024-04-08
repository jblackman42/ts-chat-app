import { useState, useEffect } from 'react';
import Popup from './Popup';

function JoinServerPopup({ open = null, setOpen, joinServer }: { open: Boolean | null, setOpen: Function, joinServer: Function }) {
  const [serverCode, setServerCode] = useState<string>('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    joinServer(serverCode);
    setServerCode('');
    setOpen(false);
  }


  useEffect(() => {
    if (open) {
      document.getElementById('join-server-code')?.focus();
    }
  }, [open]);

  return <Popup open={open} setOpen={setOpen}>
    <form onSubmit={handleSubmit} id="create-server-form">
      <div className="form-content">
        <h2>Join a Server</h2>
        <p>Enter an invite code below to join an existing server.</p>
      </div>
      <div className="form-footer">
        <label htmlFor="join-server-code" className="input-label">Server Code</label>
        <div className="flex">
          <div className="input-container">
            <input type="text" id="join-server-code" value={serverCode} onChange={(e) => setServerCode(e.target.value)} required />
          </div>
          <button type="submit">Join Server</button>
        </div>
      </div>
    </form>
  </Popup>
}

export default JoinServerPopup;