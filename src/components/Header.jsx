import { useState, useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faMoon, faSun } from "@fortawesome/free-regular-svg-icons";

import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { supabase } from "../supabase/client";

export function Header() {
  const [user, loading, error] = useSupabaseAuth();
  const [focusedTask, setFocusedTask] = useState("None");
  const path = useLocation().pathname.toLowerCase();

  useEffect(() => {
    if (!user?.id) {
      setFocusedTask("None");
      return;
    }

    const fetchFocusedTaskTitle = async () => {
      const { data: settings } = await supabase
        .from("settings")
        .select("focused_task")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settings?.focused_task) {
        const { data: task } = await supabase
          .from("tasks")
          .select("title")
          .eq("id", settings.focused_task)
          .maybeSingle();
        setFocusedTask(task?.title || "None");
      } else {
        setFocusedTask("None");
      }
    };

    fetchFocusedTaskTitle();

    const subscription = supabase
      .channel(`header-settings-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchFocusedTaskTitle(),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  if (error) {
    console.error("Auth error!");
    console.error(error);
    return <></>;
  }
  if (loading) {
    return (
      <header className="navbar shadow-lg p-0 mb-10">
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
          className={"tab h-full" + (path == "/calendar" ? " tab-active" : "")}
        >
          <NavLink to="/calendar">Calendar</NavLink>
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
        <SignInButton user={user} loading={loading} error={error} />
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

function SignInButton({ user, loading, error }) {
  return (
    <button
      className="btn"
      disabled={loading || error}
      onClick={user ? signOutAction : signInAction}
    >
      {user ? "Sign Out as " + user.email : "Sign In"}
    </button>
  );
}

async function signInAction() {
  try {
    await supabase.auth.signInWithOAuth({ provider: "google" });
    // After successful sign-in, add an entry to the settings table for the new user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) {
      console.error("Error getting user after sign-in:", userError);
      return;
    }
    await supabase.from("settings").upsert({
      user_id: user.id,
      focused_task: null,
      dark_mode: false,
      reward_currency: 0,
    });
  } catch (e) {
    console.error("Sign-in error:", e);
  }
}

async function signOutAction() {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Error signing out:", e);
  }
}
