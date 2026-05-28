import { useState, useEffect } from "react";

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

import { useTimer } from "react-timer-hook";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { supabase } from "../supabase/client";

function CountdownInput(props) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  return (
    <div className="flex flex-row focus:text-black hover:text-black">
      <input
        type="number"
        value={hours.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
        onChange={(e) => setHours(e.target.value)}
        className="w-20"
      />
      <p className="text-white">:</p>
      <input
        type="number"
        value={minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
        onChange={(e) => setMinutes(e.target.value)}
        className="w-20"
      />
      <p className="text-white">:</p>
      <input
        type="number"
        value={seconds.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
        onChange={(e) => setSeconds(e.target.value)}
        className="w-20"
      />
      <button
        className="text-white"
        onClick={(e) => {
          props.setEditing(false);
          const time = new Date();
          time.setHours(
            time.getHours() + Number(hours),
            time.getMinutes() + Number(minutes),
            time.getSeconds() + Number(seconds),
          );
          console.log(time);
          props.setLocked(true);
          props.restart(time);
        }}
      >
        Save
      </button>
    </div>
  );
}

function Countdown(props) {
  const [editing, setEditing] = useState(false);
  const startTime = Date.now();
  const { seconds, minutes, hours, isRunning, start, restart } = useTimer({
    startTime,
    autoStart: false,
    onExpire: () => {
      console.log("Timer ended");
      props.setLocked(false);
    },
  });
  return editing ? (
    <CountdownInput
      setLocked={props.setLocked}
      setEditing={setEditing}
      restart={restart}
      start={start}
    />
  ) : (
    <div
      onDoubleClick={() => {
        setEditing(true);
      }}
    >
      {isRunning ? (
        <div>
          <span>
            {hours.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
          </span>
          :
          <span>
            {minutes.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
          </span>
          :
          <span>
            {seconds.toLocaleString(undefined, { minimumIntegerDigits: 2 })}
          </span>
        </div>
      ) : (
        <p>Locked</p>
      )}
    </div>
  );
}

function Lock(props) {
  return (
    <label className="swap swap-rotate">
      <input
        type="checkbox"
        checked={props.locked}
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
      className="menu menu-horizontal hover:bg-slate-700 rounded-md active:text-black focus-within:text-black hover:text-black absolute z-10 w-fit"
      style={{ color: "white" }}
    >
      <li>
        <Lock locked={locked} setLocked={setLocked} />
      </li>
      {locked ? (
        <li>
          <Countdown setLocked={setLocked} />
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
  const [user] = useSupabaseAuth();
  const [focusedTask, setFocusedTask] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setFocusedTask(null);
      return;
    }

    const fetchFocusedTask = async () => {
      const { data: settings } = await supabase
        .from("settings")
        .select("focused_task")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settings?.focused_task) {
        const { data: task } = await supabase
          .from("tasks")
          .select("title, notes")
          .eq("id", settings.focused_task)
          .maybeSingle();
        setFocusedTask(task);
      } else {
        setFocusedTask(null);
      }
    };

    fetchFocusedTask();

    const subscription = supabase
      .channel(`home-settings-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "settings",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchFocusedTask(),
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  return (
    <div className="relative h-screen flex flex-col">
      <Menu />
      <div className="hero justify-center h-full">
        <div className="hero-content flex-col text-center space-y-5 justify-center w-full">
          <h1 className="text-5xl">Focus:</h1>
          <p className="text-8xl">
            {focusedTask?.title || "Hello! Take a break!"}
          </p>
          <div className="collapse w-2/3">
            <input type="checkbox" />
            <FontAwesomeIcon
              icon={faEllipsis}
              className="collapse-title text-center p-0 font-bold"
            />
            <div className="collapse-content text-left">
              <p>Description: {focusedTask?.notes || "None"}</p>
              <br />
              <div className="flex flex-col gap-2">
                <p>Notes:</p>
                <textarea placeholder="Write notes here!" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
