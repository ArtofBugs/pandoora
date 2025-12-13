import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faTrashCan,
  faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import { useFloating } from "@floating-ui/react-dom";

import { updateTask } from "./update-utils";
import TaskPopup from "./TaskPopup";
import { SaveButton, CancelButton, EditButton, DeleteButton } from "./Common";
import {
  createTaskNew,
  updateTaskNew,
  deleteTaskNew,
  NOTES_PLACEHOLDER,
  TASK_FIELDS,
} from "./task-utils";

import {
  collection,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { useDocument, useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import getDb, { auth } from "../firebase/initialize";

export function TaskNew({ data, initial, id, list, repeating }) {
  const [editing, setEditing] = useState(initial ?? false); // set false if undefined
  const [content, setContent] = useState(data ?? {});
  const [collapseOpen, setCollapseOpen] = useState(false);
  console.log(editing);
  console.log("content");
  console.log(content);
  console.log("data");
  console.log(data);

  return (
    <div
      className={
        "collapse collapse-arrow w-full bg-base-100 border-base-300 border" +
        (collapseOpen ? " collapse-open" : "")
      }
    >
      {/* Header */}
      <div
        className={"collapse-title font-semibold"}
        onClick={() => setCollapseOpen(!collapseOpen)}
      >
        <div className="flex flex-row gap-2">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={data.completed}
            className="checkbox"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={() =>
              updateTaskNew(list, id, { completed: !data.completed }, repeating)
            }
          />
          {/* Title */}
          {editing ? (
            <TitleInput content={content} setContent={setContent} />
          ) : (
            <>
              <div className="flex-1">
                <TitleDisplay title={data.title} checked={data.completed} />
              </div>
              <div className="flex-none">
                <EditButton
                  onEdit={() => {
                    setCollapseOpen(true);
                    setEditing(true);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      {/* Content */}
      <form className="collapse-content text-sm flex flex-col gap-10">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-4">
            {/* Time */}
            <fieldset className="fieldset flex-1">
              <TimeArea
                content={content}
                setContent={setContent}
                editing={editing}
              />
            </fieldset>
            {/* Repeating */}
            <fieldset className="fieldset">
              <RepeatArea
                content={content}
                setContent={setContent}
                editing={editing}
              />
            </fieldset>
            {/* Earns */}
            <fieldset className="flex flex-row gap-2 justify-start align-middle">
              <EarnsLabel />
              {editing ? (
                <EarnsInput content={content} setContent={setContent} />
              ) : (
                <EarnsDisplay earns={content.earns} />
              )}
            </fieldset>
          </div>
          {/* Notes */}
          <fieldset className="fieldset flex-1 flex">
            {editing ? (
              <NotesInput content={content} setContent={setContent} />
            ) : (
              <NotesDisplay notes={data.notes} />
            )}
          </fieldset>
        </div>
        <div>
          {/* Buttons */}
          <div>
            {editing ? (
              <SubmissionContainer>
                <OverwriteDropdown setContent={setContent} />
                <SaveButton
                  onSave={(e) => {
                    e.preventDefault();
                    updateTaskNew(list, id, content, repeating);
                    setEditing(false);
                  }}
                />
                <CancelButton
                  onCancel={() => {
                    setContent(data);
                    setEditing(false);
                  }}
                />
                <DeleteButton
                  onDelete={() => {
                    deleteTaskNew(list, id, repeating);
                  }}
                />
              </SubmissionContainer>
            ) : (
              <div />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export function NewTask({ list, setEditing, repeating }) {
  const [content, setContent] = useState(TASK_FIELDS);
  const [collapseOpen, setCollapseOpen] = useState(true);
  console.log("content");
  console.log(content);

  return (
    <div
      className={
        "collapse collapse-arrow bg-base-100 border-base-300 border" +
        (collapseOpen ? " collapse-open" : "")
      }
    >
      {/* Header */}
      <div
        className="collapse-title font-semibold"
        onClick={() => setCollapseOpen(!collapseOpen)}
      >
        {/* Title */}
        <TitleInput content={content} setContent={setContent} />
      </div>
      {/* Content */}
      <form className="collapse-content text-sm flex flex-col gap-10">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-4">
            {/* Time */}
            <fieldset className="fieldset flex-1">
              <TimeArea
                content={content}
                setContent={setContent}
                editing={true}
              />
            </fieldset>
            {/* Repeating */}
            <fieldset className="fieldset">
              <RepeatArea
                content={content}
                setContent={setContent}
                editing={true}
              />
            </fieldset>
            {/* Earns */}
            <fieldset className="flex flex-row gap-2 justify-start align-middle">
              <EarnsLabel />
              <EarnsInput content={content} setContent={setContent} />
            </fieldset>
          </div>
          {/* Notes */}
          <fieldset className="fieldset flex-1 flex">
            <NotesInput content={content} setContent={setContent} />
          </fieldset>
        </div>
        <div>
          {/* Buttons */}
          <div>
            <SubmissionContainer>
              <OverwriteDropdown setContent={setContent} />
              <SaveButton
                onSave={(e) => {
                  e.preventDefault();
                  createTaskNew(list, content, repeating);
                  setEditing(false);
                }}
              />
              <CancelButton
                onCancel={() => {
                  setContent({});
                  setEditing(false);
                }}
              />
            </SubmissionContainer>
          </div>
        </div>
      </form>
    </div>
  );
}

function TitleDisplay({ title, checked }) {
  return (
    <h1 className={"text-lg w-full h-full" + (checked ? " line-through" : "")}>
      {title || "Untitled Task"}
    </h1>
  );
}

function TitleInput({ content, setContent }) {
  return (
    <input
      className="input input-bordered w-full h-full"
      placeholder="Title"
      value={(content && content.title) || ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setContent({ ...content, title: e.target.value })}
    />
  );
}

function NotesDisplay({ notes }) {
  return (
    <div className="w-full h-full p-2 whitespace-pre-wrap border border-gray-300">
      {notes || ""}
    </div>
  );
}

function NotesInput({ content, setContent }) {
  return (
    <textarea
      className="border textarea textarea-neutral w-full h-full border-gray-200"
      placeholder={NOTES_PLACEHOLDER}
      value={(content && content.notes) || ""}
      onChange={(e) => setContent({ ...content, notes: e.target.value })}
    />
  );
}

function TimeArea({ editing, content, setContent }) {
  return (
    <ul className="list">
      {editing || content.time ? (
        <li className="tracking-wide font-extrabold">Time Tracking</li>
      ) : (
        <></>
      )}
      {editing ? (
        <TimeInput content={content} setContent={setContent} />
      ) : (
        <TimeDisplay content={content} />
      )}
    </ul>
  );
}

function TimeDisplay({ content }) {
  if (!content.time) {
    return <div />;
  }
  return (
    <>
      <li className="flex flex-row items-end gap-1">
        <ul className="flex-1">
          {Object.entries(content.time).map(([engagement, hour], i) => (
            <li className="list-row flex gap-1" key={i}>
              <HoursLabel label={engagement} />
              <HoursDisplay hour={hour} />
            </li>
          ))}
        </ul>
      </li>
    </>
  );
}

function TimeInput({ content, setContent }) {
  if (!content.time) {
    return <div />;
  }
  return (
    <>
      <li className="flex flex-row items-end gap-1">
        <ul className="flex-1">
          {Object.entries(content.time).map(([engagement, hour], i) => (
            <li className="list-row flex gap-1 items-end" key={i}>
              <HoursLabel label={engagement} />
              <HoursInput
                hour={hour}
                setHour={(e) =>
                  setContent({
                    ...content,
                    time: { ...content.time, [engagement]: e.target.value },
                  })
                }
              />
            </li>
          ))}
        </ul>
      </li>
    </>
  );
}

function HoursLabel({ label }) {
  return <div className="flex-1 h-min">{label || ""}</div>;
}

function HoursDisplay({ hour }) {
  return <p className="text-wrap">{hour}</p>;
}

function HoursInput({ hour, setHour, hint }) {
  return (
    <div>
      <input
        type="text"
        value={hour}
        onChange={setHour}
        className="input validator min-w-2 w-min"
      ></input>
      {/* <div className="validator-hint">{hint || "Invalid value."}</div> */}
    </div>
  );
}

function EarnsLabel({ label }) {
  return <div className="h-min w-min">{label ?? "Earns: "}</div>;
}

function EarnsDisplay({ earns }) {
  return <h1 className={"w-full h-full"}>{earns ?? ""}</h1>;
}

function EarnsInput({ content, setContent, hint }) {
  return (
    <div>
      <input
        type="text"
        value={(content && content.earns) || ""}
        onChange={(e) => setContent({ ...content, earns: e.target.value })}
        className="input validator w-min"
      ></input>
      {/* <div className="validator-hint">{hint || "Invalid value."}</div> */}
    </div>
  );
}

function RepeatArea({ content, setContent, editing }) {
  const DAYS_ORDER = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
  return (
    <div>
      <RepeatLabel label="Days " />
      {DAYS_ORDER.map((day, i) => (
        <RepeatButton
          key={i}
          text={day}
          editing={editing}
          repeat={content.repeats[day] ?? false}
          toggleRepeat={() =>
            setContent({
              ...content,
              repeats: { ...content.repeats, [day]: !content.repeats[day] },
            })
          }
        />
      ))}
    </div>
  );
}

function RepeatLabel({ label }) {
  return <div className="flex-1 h-min">{label ?? ""}</div>;
}

function RepeatButton({ text, editing, repeat, toggleRepeat }) {
  return (
    <button
      className={
        "btn rounded-full" +
        (repeat ? " bg-accent" : "") +
        (editing ? " text-primary" : " text-neutral")
      }
      disabled={!editing}
      onClick={(e) => {
        e.preventDefault();
        toggleRepeat();
      }}
    >
      {text}
    </button>
  );
}

function SubmissionContainer({ children }) {
  return <div className="flex justify-end gap-4 h-max">{children}</div>;
}

function OverwriteDropdown({ setContent }) {
  const [user, _, __] = useAuthState(auth);
  const [repeats, loading, error] = useCollection(
    collection(getDb(), "users", user?.uid, "repeats")
  );

  if (error) {
    console.error("Error retrieving repeating tasks for dropdown:", error);
  }
  return (
    <div className="dropdown dropdown-top">
      <div tabIndex={0} role="button" className="btn btn-ghost rounded-full ">
        <FontAwesomeIcon icon={faEllipsisVertical} />
      </div>
      <ul
        tabIndex="-1"
        className="dropdown-content menu bg-base-100 rounded-box z-0 w-52 p-0 shadow-sm"
      >
        <li>
          <select
            defaultValue="Replace with repeating template"
            className="select w-min"
          >
            <option disabled={true}>Replace with repeating template</option>
            {loading && <option disabled={true}>Loading templates...</option>}
            {repeats &&
              repeats.docs.map((doc) => {
                const data = doc.data();
                return (
                  <option key={doc.id} onClick={() => setContent(data)}>
                    {data.title}
                  </option>
                );
              })}
          </select>
        </li>
      </ul>
    </div>
  );
}

/* ============================================================================================= */
/* ===================================== OLD STUFF ============================================= */
/* ============================================================================================= */
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
        <div className="text-left text-wrap w-fit">{props.content}</div>
      )}
    </div>
  );
}

function MoveMenu(props) {
  const [user, _, __] = useAuthState(auth);
  // TODO: split between tasks in current list and just other lists;
  // don't allow moving to tasks in other lists
  const [value, loading, error] = useCollection(
    collection(getDb(), "users", user?.uid, "tasks")
  );
  return (
    <div
      ref={props.refs}
      style={props.style}
      className="menu menu-dropdown z-50 bg-slate-500 gap-2"
      autoFocus
      onBlur={() => {
        props.setShowMoveMenu(false);
      }}
    >
      {error && <p>Error: {JSON.stringify(error)}</p>}
      {loading && <p>...</p>}
      {value &&
        value.docs.map(
          (doc) =>
            doc.id != props.docRef.id && (
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
            )
        )}
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

export function Task(props) {
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
                "flex flex-row grow justify-between gap-x-5"
              }
            >
              <div className="w-full grow">
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
              <TaskPopup data={data} id={value.id} />
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
/* ============================================================================================= */
