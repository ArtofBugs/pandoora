import { useState } from "react";

import { NewTaskList, TaskListNew } from "../components/TaskList";
import AddEntryButton from "../components/Common";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import getDb from "../firebase/initialize";
import { NavLink } from "react-router-dom";

export default function TasksSpace() {
  // Only grab the whole collection once and handle hiding non-shown lists on the client side
  const [value, loading, error] = useCollection(
    collection(getDb(), "listsnew")
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
              />
            );
          })}
      </div>
      <div className="flex justify-end m-10">
        <div className="link link-hover">
          <NavLink to="/store">To store &gt;&gt;</NavLink>
        </div>
      </div>
    </div>
  );
}

function StoreLink() {}
