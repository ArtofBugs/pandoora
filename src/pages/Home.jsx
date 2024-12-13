import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCog,
  faEllipsis,
  faTasks,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import { faCalendar } from "@fortawesome/free-regular-svg-icons";

function Countdown(props) {
  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    expiryTimestamp,
    onExpire: () => console.warn("onExpire called"),
  });
}

function CountdownInput(props) {
  return <input type="time" />;
}

function Lock(props) {
  return (
    <label className="swap swap-rotate">
      <input
        type="checkbox"
        value={props.locked}
        onChange={() => props.setLocked(!props.locked)}
      />
      <FontAwesomeIcon icon={faLockOpen} className="swap-off white" />
      <FontAwesomeIcon icon={faLock} className="swap-on" />
    </label>
  );
}

function Menu() {
  const [locked, setLocked] = useState(false);
  return (
    <ul
      className="menu menu-horizontal hover:bg-slate-700 rounded-md"
      style={{ color: "white" }}
    >
      <li>
        <Lock locked={locked} setLocked={setLocked} />
      </li>
      {locked ? (
        <li>
          <CountdownInput />
        </li>
      ) : (
        <>
          <li>
            <NavLink to="/tasks">
              <FontAwesomeIcon icon={faTasks} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/calendar">
              <FontAwesomeIcon icon={faCalendar} />
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings">
              <FontAwesomeIcon icon={faCog} />
            </NavLink>
          </li>
        </>
      )}
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
          <p className="text-8xl">Hello! Take a break!</p>
          <div className="collapse w-2/3">
            <input type="checkbox" />
            <FontAwesomeIcon
              icon={faEllipsis}
              className="collapse-title text-center p-0 font-bold"
            />
            <div className="collapse-content text-left">
              <p>
                Description: This part doesn't really work yet, but hopefully it
                will soon!
              </p>
              <br />
              <div>
                <p>Notes:</p>
                <textarea defaultValue="https://example.com" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
