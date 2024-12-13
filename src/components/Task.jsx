import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useFloating } from "@floating-ui/react-dom";

import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
  deleteField,
  getDoc,
} from "firebase/firestore";
import { useDocument, useCollection } from "react-firebase-hooks/firestore";

import getDb from "../firebase/initialize";

// TODO: These should probably be moved to a different file
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
    await deleteOldRefs(docRef, false);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Error deleting document:", e);
  }
}

async function deleteOldRefs(docRef, keepSubtasks = true) {
  const doc = await getDoc(docRef);
  let subtasks = [];
  if (!keepSubtasks) {
    subtasks = doc.data().tasks;
  }

  const qTasks = query(
    collection(getDb(), "tasks"),
    where("tasks", "array-contains", docRef)
  );
  const oldTasksParentSnapshot = await getDocs(qTasks);

  oldTasksParentSnapshot.forEach(async (oldParent) => {
    subtasks.forEach(async (subtask) => {
      await updateDoc(oldParent.ref, {
        tasks: arrayUnion(subtask),
      });
    });

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
    subtasks.forEach(async (subtask) => {
      await updateDoc(oldParent.ref, {
        tasks: arrayUnion(subtask),
      });
    });

    await updateDoc(oldParent.ref, {
      tasks: arrayRemove(docRef),
    });
  });
}

async function updateTask(id, field, content, type) {
  console.log(content);
  if (
    ((type == "date" || type == "time") && content == "") ||
    content == "None"
  ) {
    console.log("Edited to empty date or time");
    await updateDoc(doc(getDb(), "tasks", id), {
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
    await updateDoc(doc(getDb(), "tasks", id), {
      [field]: content,
    });
  } catch (e) {
    console.error("Error updating document:", e);
  }
}

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
      onClick={(e) => {
        e.preventDefault();
      }}
      onBlur={(e) => {
        if (e.target.checkValidity()) {
          updateTask(props.id, props.field, content, props.type);
          setEditing(false);
          e.stopPropagation();
        }
      }}
      className="w-full max-w-full"
    >
      {editing ? (
        <input
          autoFocus
          id={props.id}
          type={props.type}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          className="input input-sm box-border w-full min-w-0"
        />
      ) : (
        <div className="text-left text-wrap w-full">{props.content}</div>
      )}
    </div>
  );
}

function MoveMenu(props) {
  // TODO: split between tasks in current list and just other lists;
  // don't allow moving to tasks in other lists
  // Also don't allow moving to self
  const [value, loading, error] = useCollection(collection(getDb(), "tasks"));
  return (
    <div
      ref={props.refs}
      style={props.style}
      className="menu menu-dropdown z-50 bg-slate-500"
    >
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
        className="btn btn-ghost rounded-lg w-min"
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

export default function Task(props) {
  const [value, loading, error] = useDocument(props.docRef);
  let data = value && value.exists() ? value.data() : null;
  return (
    // stopPropagation() here prevents Draggable from triggering; see
    // https://github.com/react-grid-layout/react-draggable/issues/728 and
    // https://github.com/react-grid-layout/react-draggable/issues/666#issuecomment-1425663673
    <li className="space-x-2" onMouseDown={(e) => e.stopPropagation()}>
      {loading && <p>...</p>}
      {error && <p>Error: {JSON.stringify(error)}</p>}
      {data && (
        <>
          <label className="menu h-min rounded-lg flex flex-row w-full justify-between gap-x-5">
            <input
              id={"task-complete-" + value.id}
              type="checkbox"
              className="checkbox"
              checked={data.completed}
              onChange={() =>
                updateTask(value.id, "completed", !data.completed, "boolean")
              }
            />
            <div
              className={
                (data.completed ? "line-through " : "") +
                "flex flex-row flex-grow justify-between gap-x-5"
              }
            >
              <div className="w-full flex-grow">
                <EditableField
                  id={value.id}
                  field="name"
                  content={data.name || `Untitled task ${value.id}`}
                  type="text"
                />
              </div>
              <p className="min-w-20">
                Due date:
                <EditableField
                  id={value.id}
                  field="due_date"
                  content={
                    (data.due_date &&
                      data.due_date.toDate().toLocaleDateString()) ||
                    "None"
                  }
                  type="date"
                />
              </p>
              <p className="w-200 min-w-20">
                Due time:
                <EditableField
                  id={value.id}
                  field="due_time"
                  content={
                    data.due_time
                      ? data.due_time.toDate().toLocaleTimeString()
                      : "None"
                  }
                  type="time"
                />
              </p>
              <MoveMenuButton docRef={props.docRef} />
              <button
                onClick={() => {
                  deleteTask(props.docRef);
                }}
                className="btn btn-ghost rounded-lg w-min"
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
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
