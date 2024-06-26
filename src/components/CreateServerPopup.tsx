import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboard, faCheck } from '@fortawesome/pro-regular-svg-icons';
import { IconDefinition } from "@fortawesome/pro-regular-svg-icons";
import { faBug, faHouse, faStar, faFaceSmile, faHeart, faGhost, faFire, faGlobe, faSnowflake, faPlanetRinged, faPalette, faFlask, faComments, faCloud, faPoo, faMusic, faLocationDot, faEnvelope } from '@fortawesome/pro-regular-svg-icons';
import Popup from './Popup';

const iconOptions = [faBug, faHouse, faStar, faFaceSmile, faHeart, faGhost, faFire, faGlobe, faSnowflake, faPlanetRinged, faPalette, faFlask, faComments, faCloud, faPoo, faMusic, faLocationDot, faEnvelope];

function CreateServerPopup({ open = null, setOpen, createServer }: { open: Boolean | null, setOpen: Function, createServer: Function }) {
  const [serverName, setServerName] = useState<string>('');
  const [serverCode, setServerCode] = useState<string>('');
  const [serverIcon, setServerIcon] = useState<IconDefinition>(iconOptions[0])
  const [isCodeCoppied, setisCodeCoppied] = useState<Boolean>(false);

  const copyCodeToClipboard = async () => {
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

  const generateUniqueCode = () => {
    // Use a part of the timestamp to ensure some degree of uniqueness
    const now = new Date();
    const timePart = now.getTime().toString(36).slice(-4); // Last 4 digits from the timestamp

    // Generate random characters
    const possibleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      const randIndex = Math.floor(Math.random() * possibleChars.length);
      randomPart += possibleChars.charAt(randIndex);
    }

    // Combine both parts
    const code = timePart + randomPart;

    return code;
  };

  useEffect(() => {
    setServerCode(generateUniqueCode());
  }, [open]);

  useEffect(() => {
    if (open) {
      document.getElementById('server-name')?.focus();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    createServer(serverName, serverCode, serverIcon);
    setOpen(false);
    setServerName('');
    setServerCode('');
    setServerIcon(iconOptions[0])
  }

  return <Popup open={open} setOpen={setOpen}>
    <form onSubmit={handleSubmit} id="create-server-form">
      <div className="form-content">
        <h2>Create Your Server</h2>
        <p>Your server is where you and your friends hand out. Make yours and start talking.</p>
        <div className="input-container">
          <label htmlFor="server-name" className="input-label">Server Name</label>
          <input type="text" id="server-name" value={serverName} onChange={(e) => setServerName(e.target.value)} required />
        </div>
        <div className="input-container">
          <p className="input-label">Server Icon</p>
          <div className="icon-selector-container">
            {iconOptions.map((icon, i) => {
              const { iconName } = icon;
              return <div className="icon-selector" key={i}>
                <input type="radio" name="server-icon" id={iconName} checked={serverIcon === icon} onChange={() => setServerIcon(icon)} />
                <label htmlFor={iconName}><FontAwesomeIcon icon={icon} /></label>
              </div>
            })}
          </div>
        </div>
      </div>
      <div className="form-footer">
        <label htmlFor="server-code" className="input-label">Server Code</label>
        <div className="flex">
          <div className="input-container">
            <input type="text" id="server-code" value={serverCode} readOnly />
            <button id="copy-code" type="button" onClick={(e) => { e.preventDefault(); copyCodeToClipboard(); }} data-copy-msg={isCodeCoppied ? 'Copied!' : null}>
              <FontAwesomeIcon icon={isCodeCoppied ? faCheck : faClipboard} />
            </button>
          </div>
          <button type="submit" disabled={!Boolean(serverName)}>Create</button>
        </div>
      </div>
    </form>
  </Popup>
}

export default CreateServerPopup;