import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";
import { NavLink } from "react-router-dom";

export function Header() {
  const [focusedTask, setFocusedTask] = useState("None");
  return (
    <header className="flex flex-row w-screen bg-base p-2">
      <h1 className="p-5">
        <NavLink to="/">Pandoora</NavLink>
      </h1>
      <div className="divider divider-horizontal"></div>
      <h1 className="grow p-5">Focus task: {focusedTask}</h1>
      <label className="swap swap-rotate" htmlFor="theme-switch">
        <input
          id="theme-switch"
          type="checkbox"
          className="theme-controller"
          value="dark"
        />
        <FontAwesomeIcon icon={faMoon} className="swap-on" />
        <FontAwesomeIcon icon={faSun} className="swap-off" />
      </label>
    </header>
  );
}
