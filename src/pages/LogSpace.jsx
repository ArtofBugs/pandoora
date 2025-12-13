import { LogEntry, NewLogEntry } from "../components/LogEntry";
import AddEntryButton from "../components/Common";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import getDb, { auth } from "../firebase/initialize";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function LogSpace() {
  const [user, _, __] = useAuthState(auth);
  // TODO: Would a race happen if auth state loaded too slow?
  const [value, loading, error] = useCollection(
    collection(getDb(), "users", user?.uid, "log")
  );
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex grow gap-4 flex-col pl-10 pr-10">
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
              initial={false}
            />
          );
        })}
    </div>
  );
}
