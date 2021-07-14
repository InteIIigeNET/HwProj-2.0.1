import React from "react";
import "./Footer.css";

const Footer: React.FC = (props) => {
  return (
    <footer className="Footer">
      <span style={{ width: "4rem" }} />
      <p>HwProj Course Work</p>
      <span style={{ marginRight: "0.5rem" }}>{props.children}</span>
    </footer>
  );
};

export default Footer;
