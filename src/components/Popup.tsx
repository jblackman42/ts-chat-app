import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/pro-regular-svg-icons';

function Popup({ open = null, setOpen, children }: { open: Boolean | null, setOpen: Function, children: React.ReactNode }) {


  useEffect(() => {
    if (open) {
      document.getElementById('server-name')?.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, [setOpen]);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === document.getElementById('popup-container')) setOpen(false);
  }

  return <div id="popup-container" className={open === true ? 'open' : open === false ? 'close' : ''} onClick={handleOutsideClick}>
    <div id="popup">
      <button id="close-btn" onClick={() => setOpen(false)}><FontAwesomeIcon icon={faXmark} /></button>
      {children}
    </div>
  </div>;
}

export default Popup;