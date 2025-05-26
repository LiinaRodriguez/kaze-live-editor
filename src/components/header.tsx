import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
  return (
    <div className="header">
      <h2><a href="/">Kaze Playground</a></h2>
      <ul className="links">
        <li className="link-item">
          <a href="https://github.com/liinarodriguez/kaze-live-editor" target="_blank">
            <FontAwesomeIcon icon={faGithub} /> Github
          </a>
        </li>
        <li className="link-item">
          <a href="#">
            <FontAwesomeIcon icon={faBook} /> Docs
          </a>
        </li>
      </ul>
    </div>
  );
}