import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faPlusCircle,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import Draggable from "react-draggable";
import { useFloating } from "@floating-ui/react-dom";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useDocument } from "react-firebase-hooks/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import getDb from "../firebase/initialize";

function MoveMenu(props) {
  // TODO: split between tasks in current list and just other lists;
  // don't allow moving to tasks in other lists
  // Also don't allow moving to self
  const [value, loading, error] = useCollection(collection(getDb(), "tasks"));
  return (
    <div ref={props.refs} style={props.style} className="menu menu-dropdown">
      {error && <p>Error: {JSON.stringify(error)}</p>}
      {loading && <p>...</p>}
      {value &&
        value.docs.map((doc) => (
          <button
            key={`move_menu_${doc.id}`}
            className="btn"
            onClick={() => {
              moveTask(props.docRef, doc.ref);
              props.setShowMoveMenu(false);
            }}
          >
            {doc.data().name || `Untitled task ${doc.id}`}
          </button>
        ))}
    </div>
  );
}
function MoveMenuButton(props) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const { refs, floatingStyles } = useFloating();
  return (
    <>
      <button
        onClick={() => {
          setShowMoveMenu(!showMoveMenu);
        }}
        className="btn btn-ghost rounded-lg"
        ref={refs.setReference}
      >
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
      {showMoveMenu && (
        <MoveMenu
          setShowMoveMenu={setShowMoveMenu}
          refs={refs.setFloating}
          style={floatingStyles}
          docRef={props.docRef}
        />
      )}
    </>
  );
}

function EditableField(props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(
    props.content || props.default_value || ""
  );
  return (
    <div
      onDoubleClick={() => {
        setEditing(true);
        // Update to latest content
        setContent(props.content);
      }}
      onBlur={() => {
        setEditing(false);
        updateTask(props.id, props.field, content, props.type);
      }}
    >
      {editing ? (
        <input
          id={props.id}
          type="text"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
        />
      ) : (
        <div>{props.content}</div>
      )}
    </div>
  );
}

function Task(props) {
  const [value, loading, error] = useDocument(props.docRef);
  let data = value && value.exists() ? value.data() : null;
  console.log(data);
  return (
    <li className="space-x-2">
      {loading && <p>...</p>}
      {error && <p>Error: {JSON.stringify(error)}</p>}
      {data && (
        <>
          <input
            id={value.id}
            type="checkbox"
            className="checkbox"
            checked={data.completed}
            onChange={() =>
              updateTask(value.id, "completed", !data.completed, "boolean")
            }
          />
          <label
            htmlFor={value.id}
            className={data.completed && "line-through"}
          >
            {data.name || `Untitled task ${value.id}`}
            <p>
              Due date:
              <EditableField
                id={value.id}
                field="due_date"
                content={
                  data.due_date && data.due_date.toDate().toLocaleDateString()
                }
                default_value="None"
                type="timestamp"
              />
            </p>
            <p>
              Due time:
              <EditableField
                id={value.id}
                field="due_date"
                content={
                  data.due_time
                    ? data.due_time.toDate().toLocaleTimeString()
                    : undefined
                }
                default_value="None"
                type="timestamp"
              />
            </p>
            <MoveMenuButton docRef={props.docRef} />
            <button
              onClick={() => {
                deleteTask(props.docRef);
              }}
              className="btn btn-ghost rounded-lg"
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>
          </label>
          {data.tasks && (
            <>
              <ul>
                {data.tasks.map((task) => (
                  <Task key={task.id} docRef={task} />
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </li>
  );
}

async function deleteOldRefs(docRef) {
  const qTasks = query(
    collection(getDb(), "tasks"),
    where("tasks", "array-contains", docRef)
  );
  const oldTasksParentSnapshot = await getDocs(qTasks);

  oldTasksParentSnapshot.forEach(async (oldParent) => {
    await updateDoc(oldParent.ref, {
      tasks: arrayRemove(docRef),
    });
  });

  const qLists = query(
    collection(getDb(), "lists"),
    where("tasks", "array-contains", docRef)
  );
  const oldListsParentSnapshot = await getDocs(qLists);

  oldListsParentSnapshot.forEach(async (oldParent) => {
    await updateDoc(oldParent.ref, {
      tasks: arrayRemove(docRef),
    });
  });
}

async function addTask(name, listID) {
  // TODO: warn on duplicates
  try {
    const taskRef = await addDoc(collection(getDb(), "tasks"), {
      name: name,
      tasks: [],
    });
    console.log(`Document written with ID '${taskRef.id}' and name '${name}'`);

    await updateDoc(doc(getDb(), "lists", listID), {
      tasks: arrayUnion(taskRef),
    });
  } catch (e) {
    console.error("Error adding document:", e);
  }
}

async function moveTask(docRef, newParentRef) {
  try {
    await deleteOldRefs(docRef);
    await updateDoc(newParentRef, {
      tasks: arrayUnion(docRef),
    });
  } catch (e) {
    console.error("Error moving document:", e);
  }
}

async function deleteTask(docRef) {
  try {
    await deleteOldRefs(docRef);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting document:", e);
  }
}

async function updateTask(id, field, content, type) {
  if (type == "timestamp_date") {
    content = new Date(content);
  } else if (type == "timestamp_time") {
    // FIXME: Time parsing probably doesn't work
    content = new Date("1970-01-01T" + content);
  } else if (type == "number") {
    content = Number(content);
  }
  try {
    await updateDoc(doc(getDb(), "tasks", id), {
      [field]: content,
    });
  } catch (e) {
    console.error("Error updating document:", e);
  }
}

// FIXME: Known issue https://github.com/react-grid-layout/react-draggable/issues/749
function List(props) {
  const [newTask, setNewTask] = useState("");
  return (
    <Draggable>
      <div className="menu bg-base-200 rounded-box w-56">
        <h1>{props.data.name || `Untitled list ${props.id}`}</h1>
        <ul>
          {props.data.tasks &&
            props.data.tasks.map((taskRef) => (
              <Task key={taskRef.id} docRef={taskRef} />
            ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask(newTask, props.id);
          }}
        >
          <input
            className="input"
            type="text"
            value={newTask}
            onChange={(e) => {
              setNewTask(e.target.value);
            }}
          />
          <button type="submit" className="btn btn-circle btn-outline">
            <FontAwesomeIcon icon={faPlusCircle} />
          </button>
        </form>

        {/* <ul>
          <li>
            <details open>
              <summary>
                <Task name="test" />
              </summary>
              <ul>
                <li>
                  <Task />
                </li>
                <li>
                  <Task />
                </li>
                <li>
                  <details open>
                    <summary>
                      <Task />
                    </summary>
                    <ul>
                      <li>
                        <details open>
                          <summary>
                            <Task />
                          </summary>
                        </details>
                      </li>
                    </ul>
                  </details>
                </li>
              </ul>
            </details>
          </li>
          <li>
            <Task />
          </li>
        </ul> */}
      </div>
    </Draggable>
  );
}

export default function ListsSpace(props) {
  return (
    <div className="grid">
      {props.error && <p>Error: {JSON.stringify(props.error)}</p>}
      {props.loading && <p>...</p>}
      {props.value &&
        props.value.docs.map((doc) => (
          <List key={doc.id} id={doc.id} data={doc.data()} />
        ))}
    </div>
  );
}
