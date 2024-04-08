import React from 'react';
import { Link, To } from "react-router-dom";

type NavbarLinkProps = {
  title: string,
  // Separate the concerns: Use 'To' for links and optionally include an onClick handler
  to?: To,
  onClick?: () => void,
  icon: React.ReactNode
}

const NavbarLink = ({ title, to, onClick, icon }: NavbarLinkProps) => {
  const isLink = to !== undefined;
  const content = <>
    <li className={`link ${to === window.location.pathname ? 'active' : ''}`}>
      <div className="img-container">{icon}</div>
      <p className="link-title">{title}</p>
    </li>
    {to === '/' && <hr className="spacer" />}
  </>

  return isLink ? (
    <Link className="link-action" to={to}>{content}</Link>
  ) : (
    <button className="link-action" onClick={onClick}>{content}</button>
  )
};

function Navbar({ links = [] }: { links?: Array<NavbarLinkProps> }) {
  return (
    <nav>
      <p id="text-logo">Discourse</p>
      <ul className="link-list">
        {links.map((link, i) => <NavbarLink
          title={link.title}
          to={link.to}
          onClick={link.onClick}
          icon={link.icon}
          key={i}
        />)}
      </ul>
    </nav>
  );
}

export type {
  NavbarLinkProps
};
export default Navbar;