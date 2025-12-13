import { useState } from "react";
import { NavLink } from "react-router-dom";

import { collection, updateDoc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import { TaskNew, NewTask } from "../components/Task";
import AddEntryButton from "../components/Common";
import getDb, { auth } from "../firebase/initialize";

export default function RepeatsSpace() {
  const [user, _, __] = useAuthState(auth);
  const [value, loading, error] = useCollection(
    collection(getDb(), "users", user?.uid, "repeats")
  );
  const [editing, setEditing] = useState(false);

  return (
    <div className="ml-10 mr-10 flex flex-col gap-4">
      <div className="flex flex-row justify-between align-bottom">
        <RepeatsHeading />
        <ClearAllButton content={value && value.docs} />
      </div>
      <div className="flex gap-4 flex-col">
        {error && <p>Error: {JSON.stringify(error)}</p>}
        {loading && <p>...</p>}
        {value &&
          value.docs.map((doc) => {
            return (
              <TaskNew
                key={doc.id}
                id={doc.id}
                data={doc.data() || {}}
                initial={false}
                repeating={true}
              />
            );
          })}
      </div>
      {editing ? (
        <NewTask list="" setEditing={setEditing} repeating={true} />
      ) : (
        <AddEntryButton onClick={() => setEditing(true)} />
      )}
      <div className="mt-10 mb-10">
        <ListsLink />
      </div>
    </div>
  );
}

function RepeatsHeading() {
  return <h1 className="text-xl h-min font-light">Repeating Events</h1>;
}

function ClearAllButton({ content }) {
  return (
    <button
      className="btn"
      onClick={() => {
        content.forEach((doc) => clearAll(doc.ref));
      }}
    >
      Start New Rotation
    </button>
  );
}

async function clearAll(doc) {
  try {
    await updateDoc(doc, { completed: false });
  } catch (e) {
    console.error("Error updating completion:", e);
  }
}

function ListsLink() {
  return (
    <NavLink to="/tasks">
      <button className="btn border-gray-200 text-gray-800 font-normal">
        Switch to lists view
      </button>
    </NavLink>
  );
}
