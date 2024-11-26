import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faEllipsis, faTasks } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";

function Menu() {
  return (
    <ul className="menu menu-horizontal hover:bg-slate-700 rounded-md">
      <li>
        <NavLink to="/tasks">
          <FontAwesomeIcon icon={faTasks} style={{ color: "white" }} />
        </NavLink>
      </li>
      <li>
        <NavLink to="/calendar">
          <FontAwesomeIcon icon={faCalendar} style={{ color: "white" }} />
        </NavLink>
      </li>
      <li>
        <NavLink to="/settings">
          <FontAwesomeIcon icon={faCog} style={{ color: "white" }} />
        </NavLink>
      </li>
    </ul>
  );
}

// FIXME: How can I get the other stuff to not move up when the task details are shown?
export default function Home() {
  return (
    <div className="relative">
      <Menu className="absolute z-10" />
      <div className="hero">
        <div className="hero-content flex-col text-center h-screen space-y-5 justify-center">
          <h1 className="text-5xl">Focus:</h1>
          <p className="text-8xl">Task title</p>
          <div className="collapse w-2/3">
            <input type="checkbox" />
            <FontAwesomeIcon
              icon={faEllipsis}
              className="collapse-title text-center p-0 font-bold"
            />
            <div className="collapse-content text-left">
              <p>
                Description: Task details would go here, but this part doesn't
                work yet - everything is still hardcoded right now.
              </p>
              <br />
              <div>
                <p>Links:</p>
                <a className="link" href="https://example.com">
                  https://example.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
