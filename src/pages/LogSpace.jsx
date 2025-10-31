import { LogEntry, NewLogEntry } from "../components/LogEntry";
import AddEntryButton from "../components/Common";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import getDb from "../firebase/initialize";
import { useState } from "react";

export default function LogSpace() {
  const [value, loading, error] = useCollection(collection(getDb(), "log"));
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex flex-grow gap-4 flex-col pl-10 pr-10">
      {editing ? (
        <NewLogEntry data={{}} setEditing={setEditing} />
      ) : (
        <AddEntryButton onClick={() => setEditing(true)} />
      )}
      {error && <p>Error: {JSON.stringify(error)}</p>}
      {loading && <p>...</p>}
      {value &&
        value.docs.map((doc) => {
          return (
            <LogEntry
              key={doc.id}
              id={doc.id}
              data={doc.data() || {}}
              initial={true}
            />
          );
        })}
    </div>
  );
}
