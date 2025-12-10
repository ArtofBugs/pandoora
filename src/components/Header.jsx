import { useState } from "react";
import { useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import { NavLink } from "react-router-dom";

export function Header() {
  const [focusedTask, setFocusedTask] = useState("None");
  const path = useLocation().pathname;

  return (
    <header className="navbar shadow-lg p-0 mb-10">
      {/* Logo */}
      <h1 className="navbar-start flex-0 bg-slate-300 h-full m-0 p-5 flex align-middle justify-center">
        <NavLink to="/">Pandoora</NavLink>
      </h1>
      {/* Tabs */}
      <div
        role="tablist"
        className="navbar-center tabs tabs-box flex justify-center h-full flex-2"
      >
        <div
          role="tab"
          className={"tab h-full" + (path == "/tasks" ? " tab-active" : "")}
        >
          <NavLink to="/tasks">Tasks</NavLink>
        </div>
        <div
          role="tab"
          className={"tab h-full" + (path == "/log" ? " tab-active" : "")}
        >
          <NavLink to="/log">Log</NavLink>
        </div>
      </div>
      <div className="navbar-end min-w-1/3 w-min flex flex-row">
        {/* Focus task */}
        <h1 className="flex-1 whitespace-nowrap p-5">
          Focus task: {focusedTask}
        </h1>
        {/* Theme switch */}
        <label className="flex-0 swap swap-rotate p-5" htmlFor="theme-switch">
          <input
            id="theme-switch"
            type="checkbox"
            className="theme-controller"
            value="dark"
          />
          <FontAwesomeIcon icon={faMoon} className="swap-on" />
          <FontAwesomeIcon icon={faSun} className="swap-off" />
        </label>
      </div>
    </header>
  );
}
