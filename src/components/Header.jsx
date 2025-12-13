import { useState } from "react";
import { useLocation, NavLink } from "react-router-dom";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";

import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup, signOut } from "firebase/auth";

import { auth, googleProvider } from "../firebase/initialize";

export function Header() {
  // TODO: Implement focused task stuff
  const [user, loading, error] = useAuthState(auth);
  const [focusedTask, setFocusedTask] = useState("None");
  const path = useLocation().pathname.toLowerCase();

  if (error) {
    console.error("Auth error!");
    console.error(error);
    return <></>;
  }
  if (loading) {
    return (
      <header className="navbar shadow-lg p-0 mb-10">
        {/* Logo */}
        <h1 className="navbar-start flex-0 bg-slate-300 h-full m-0 p-5 flex align-middle justify-center">
          <NavLink to="/">Pandoora</NavLink>
        </h1>
      </header>
    );
  }

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
      <div className="navbar-end min-w-1/3 w-min flex-0 flex flex-row pr-4">
        {/* Focus task */}
        <h1 className="flex-1 whitespace-nowrap p-5">
          Focus task: {focusedTask}
        </h1>
        {/* Sign-In */}
        <SignInButton />
        {/* TODO: Dark theme?? */}
        {/* Theme switch */}
        {/* <label className="flex-0 swap swap-rotate p-5" htmlFor="theme-switch">
          <input
            id="theme-switch"
            type="checkbox"
            className="theme-controller"
            value="dark"
          />
          <FontAwesomeIcon icon={faMoon} className="swap-on" />
          <FontAwesomeIcon icon={faSun} className="swap-off" />
        </label> */}
      </div>
    </header>
  );
}

// Adapted the auth hook stuff from a helpful tutorial from Google's AI Overview,
// since react-firebase-hooks is generally *very* lacking in documentation.
function SignInButton() {
  const [user, loading, error] = useAuthState(auth);

  return (
    <button
      className="btn"
      disabled={loading || error}
      onClick={user ? signOutAction : signInAction}
    >
      {user ? "Sign Out as " + user.displayName : "Sign In"}
    </button>
  );

  // const [_, user, loading, error] = useSignInWithGoogle(auth);
  // console.log("user:");
  // console.log(user);
  // return (
  //   <button
  //     className="btn"
  //     disabled={loading || error}
  //     onClick={user ? signOut : signIn}
  //   >
  //     {user ? "Sign Out as " + user.user.displayName : "Sign In"}
  //   </button>
  // );
}

// Use Sign in with Google
async function signInAction() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (e) {
    console.error("Sign-in error:", e);
  }
}

async function signOutAction() {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("Error signing out:", e);
  }
}
