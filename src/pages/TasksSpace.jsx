// import { useState } from "react";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import getDb from "../firebase/initialize";

export default function TasksSpace() {
  // Only grab the whole collection once and handle hiding non-shown lists on the client side
  const [value, loading, error] = useCollection(collection(getDb(), "lists"));
  // const [editing, setEditing] = useState(false);

  return (
    <div className="flex grow gap-4 flex-col pl-10 pr-10">
      {/* {editing ? (
        <NewList data={{}} setEditing={setEditing} />
      ) : (
        <AddListButton onClick={() => setEditing(true)} />
      )} */}
      {error && <p>Error: {JSON.stringify(error)}</p>}
      {loading && <p>...</p>}
      {value &&
        value.docs.map((doc) => {
          return (
            <TaskList
              key={doc.id}
              id={doc.id}
              data={doc.data() || {}}
              initial={false}
            />
          );
        })}
    </div>
  );
}
