import { useState } from "react";

import { doc, updateDoc } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import getDb, { auth } from "../firebase/initialize";

// TODO: lots of duplication with task updating :(((
async function updateSettings(id, field, content, type) {
  console.log(content);
  if (
    ((type == "date" || type == "time") && content == "") ||
    content == "None"
  ) {
    console.log("Edited to empty date or time");
    await updateDoc(doc(getDb(), "settings", id), {
      [field]: deleteField(),
    });
    return;
  }
  if (type == "date") {
    content = new Date(content + " 00:00:00");
  } else if (type == "time") {
    content = new Date("1970-01-01 " + content);
  } else if (type == "number") {
    content = Number(content);
  } else {
  }

  try {
    console.log(`Updating ${field} to ${content}`);
    await updateDoc(doc(getDb(), "settings", id), {
      [field]: content,
    });
  } catch (e) {
    console.error("Error updating document:", e);
  }
}

function UserSettings(props) {
  const [name, setName] = useState(props.data.name || "");
  return (
    <div className="p-5">
      <h1 className="font-bold p-2">Settings</h1>
      <div className="flex gap-2">
        <label
          htmlFor="editName"
          className="input input-bordered flex items-center gap-2 w-fit"
        >
          Your name
          <input
            id="editName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button
          className="btn"
          onClick={() => {
            updateSettings(props.id, "name", name, "text");
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

// TODO: Use Firebase Auth eventually?
// TODO: Other collections would need to be moved or have user fields added
// (different collections for different users preferable for access control)
// TODO: Right now it's hardcoded to first result; figure something out eventually
export default function Settings() {
  const [user, _, __] = useAuthState(auth);
  const [value, loading, error] = useCollection(
    collection(getDb(), "users", user?.uid, "settings")
  );
  let data = value ? value.docs[0].data() : null;
  return (
    <div>
      {error && <p>Error: {JSON.stringify(error)}</p>}
      {loading && <p>...</p>}
      {data && <UserSettings id={value.docs[0].id} data={data} />}
    </div>
  );
}
