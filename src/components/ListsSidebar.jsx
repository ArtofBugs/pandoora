import { useState } from "react";

import {
  faEye,
  faEyeSlash,
  faPlusCircle,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { NavLink } from "react-router-dom";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import getDb from "../firebase/initialize";


function EditableField(props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(props.content || "None");
  return (
    <div
      onDoubleClick={(e) => {
        setEditing(true);
        // Update to latest content
        setContent(props.content);
      }}
      onBlur={(e) => {
        if (e.target.checkValidity()) {
          updateList(props.id, props.field, content, props.type);
          setEditing(false);
        }
      }}
    >
      {editing ? (
        <input
          id={props.id}
          type={props.type}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
        />
      ) : (
        <p>{props.content}</p>
      )}
    </div>
  );
}

function ListEntry(props) {
  // FontAwesome doesn't have an eye-closed icon :(
  // https://github.com/FortAwesome/Font-Awesome/issues/8283
  return (
    <div className="label cursor-pointer space-x-2 btn-ghost btn-wide rounded-lg">
      <label htmlFor={props.id} className="swap btn-circle btn-ghost">
        <input type="checkbox" id={props.id} />
        <FontAwesomeIcon icon={faEye} className="swap-on" />
        <FontAwesomeIcon icon={faEyeSlash} className="swap-off" />
      </label>
      <EditableField
        id={props.id}
        field="name"
        content={props.data.name || `Untitled list ${props.id}`}
        type="text"
      />
      <button
        onClick={() => {
          deleteList(props.id);
        }}
        className="btn btn-ghost rounded-lg"
      >
        <FontAwesomeIcon icon={faTrashCan} />
      </button>
    </div>
  );
}

async function addList(name) {
  // TODO: warn on duplicates
  try {
    const listRef = await addDoc(collection(getDb(), "lists"), {
      name: name,
    });
    console.log(`Document written with ID '${listRef.id}' and name '${name}'`);
  } catch (e) {
    console.error("Error adding document:", e);
  }
}

async function updateList(id, field, content, type) {
  try {
    console.log(`Updating ${field} to ${content}`);
    await updateDoc(doc(getDb(), "lists", id), {
      [field]: content,
    });
  } catch (e) {
    console.error("Error updating document:", e);
  }
}
async function deleteList(id) {
  try {
    await deleteDoc(doc(getDb(), "lists", id));
  } catch (e) {
    console.error("Error deleting document:", e);
  }
}

// TODO: refactor docRef/key/id/data stuff... is this too repetitive?
export default function ListsSidebar(props) {
  const [newList, setNewList] = useState("");
  return (
    <aside className="bg-base-200 h-screen p-2">
      <br />
      {props.error && <p>Error: {JSON.stringify(error)}</p>}
      {props.loading && <p>Loading lists...</p>}
      {props.value && (
        <>
          <div className="form-control">
            {props.value.docs.map((doc) => (
              <ListEntry
                key={doc.id}
                id={doc.id}
                data={doc.data()}
                docRef={doc}
              />
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addList(newList);
            }}
          >
            <input
              className="input"
              type="text"
              value={newList}
              onChange={(e) => {
                setNewList(e.target.value);
              }}
            />
            <button type="submit" className="btn btn-circle btn-outline">
              <FontAwesomeIcon icon={faPlusCircle} />
            </button>
          </form>

          <NavLink to="/store">
            <button className="btn-primary btn-outline btn-wide">
              Go to store
            </button>
          </NavLink>
        </>
      )}
    </aside>
  );
}
