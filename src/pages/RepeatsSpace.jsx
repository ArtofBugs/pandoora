import { useState } from "react";
import { NavLink } from "react-router-dom";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import { TaskNew } from "../components/Task";
import getDb from "../firebase/initialize";
import { getToday } from "../components/repeat-utils";

export default function RepeatsSpace() {
  const [value, loading, error] = useCollection(collection(getDb(), "repeats"));
  const today = getToday();

  return (
    <div>
      <div className="flex gap-4 flex-col ml-10 mr-10">
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
              />
            );
          })}
      </div>
      <div className="m-10">
        <ListsLink />
      </div>
    </div>
  );
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
