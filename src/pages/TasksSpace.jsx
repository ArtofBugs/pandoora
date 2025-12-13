import { useState } from "react";

import { NewTaskList, TaskListNew } from "../components/TaskList";
import AddEntryButton from "../components/Common";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import getDb, { auth } from "../firebase/initialize";
import { NavLink } from "react-router-dom";

export default function TasksSpace() {
  const [user, _, __] = useAuthState(auth);
  const [value, loading, error] = useCollection(
    collection(getDb(), "users", user?.uid, "listsnew")
  );
  const [editing, setEditing] = useState(false);

  return (
    <div>
      <div className="flex gap-4 flex-col ml-10 mr-10">
        {editing ? (
          <NewTaskList data={{}} setEditing={setEditing} />
        ) : (
          <AddEntryButton onClick={() => setEditing(true)} />
        )}
        {error && <p>Error: {JSON.stringify(error)}</p>}
        {loading && <p>...</p>}
        {value &&
          value.docs.map((doc) => {
            return (
              <TaskListNew
                key={doc.id}
                id={doc.id}
                data={doc.data() || {}}
                initial={false}
                repeating={true}
              />
            );
          })}
      </div>
      <div className="flex justify-between m-10">
        <RepeatsLink />
        <StoreLink />
      </div>
    </div>
  );
}

function RepeatsLink() {
  return (
    <NavLink to="/repeats">
      <button className="btn border-gray-200 text-gray-800 font-normal">
        Switch to repeating tasks view
      </button>
    </NavLink>
  );
}

function StoreLink() {
  return (
    <div className="link link-hover">
      <NavLink to="/store">To store &gt;&gt;</NavLink>
    </div>
  );
}
