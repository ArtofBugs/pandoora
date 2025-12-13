import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import Draggable from "react-draggable";

import { TaskNew, NewTask, Task } from "./Task";
import AddEntryButton, {
  SaveButton,
  CancelButton,
  EditButton,
  DeleteButton,
} from "./Common";
import {
  createTaskList,
  updateTaskList,
  deleteTaskList,
  NOTES_PLACEHOLDER,
} from "./tasklist-utils";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";

import getDb from "../firebase/initialize";

export function TaskListNew({ data, initial, id }) {
  const [editing, setEditing] = useState(initial ?? false); // set false if undefined
  const [content, setContent] = useState(data ?? {});
  const [collapseOpen, setCollapseOpen] = useState(false);
  console.log(editing);
  console.log("content");
  console.log(content);
  console.log("data");
  console.log(data);
  console.log("list id");
  console.log(id);

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
        {editing ? (
          <TitleInput content={content} setContent={setContent} />
        ) : (
          <div className="flex">
            <div className="flex-1">
              <TitleDisplay title={data.title} />
            </div>
            <div className="flex-none">
              <EditButton
                onEdit={() => {
                  setCollapseOpen(true);
                  setEditing(true);
                }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="collapse-content text-sm flex flex-col gap-10">
        {/* Content */}
        <div className="flex flex-col gap-1">
          {/* Notes */}
          <fieldset className="fieldset flex-1 flex">
            {editing ? (
              <NotesInput content={content} setContent={setContent} />
            ) : (
              <NotesDisplay notes={data.notes} />
            )}
          </fieldset>
          {/* Tasks */}
          <div className="fieldset flex-1">
            <TaskArea list={id} />
          </div>
        </div>
        {/* Buttons */}
        {editing ? (
          <SubmissionContainer>
            <SaveButton
              onSave={() => {
                updateTaskList(id, content);
                setEditing(false);
              }}
            />
            <CancelButton
              onCancel={() => {
                setEditing(false);
              }}
            />
            <DeleteButton
              onDelete={() => {
                deleteTaskList(id);
              }}
            />
          </SubmissionContainer>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export function NewTaskList({ setEditing }) {
  const [content, setContent] = useState({ title: "", notes: "", tasks: {} });
  const [collapseOpen, setCollapseOpen] = useState(true);

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
      <div className="collapse-content text-sm flex flex-col gap-4 h-max">
        <div className="flex flex-col gap-10">
          {/* Notes */}
          <fieldset className="fieldset flex-1 flex">
            <NotesInput content={content} setContent={setContent} />
          </fieldset>
        </div>
        {/* Buttons */}
        <div>
          <SubmissionContainer>
            <SaveButton
              onSave={(e) => {
                e.preventDefault();
                createTaskList(content);
                setEditing(false);
              }}
            />
            <CancelButton
              onCancel={(e) => {
                e.preventDefault();
                setContent({});
                setEditing(false);
              }}
            />
          </SubmissionContainer>
        </div>
      </div>
    </div>
  );
}

function TitleDisplay({ title }) {
  return <h1 className="text-lg w-full">{title || "Untitled List"}</h1>;
}

function TitleInput({ content, setContent }) {
  return (
    <input
      className="input input-bordered w-full"
      placeholder="Title"
      value={(content && content.title) || ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setContent({ ...content, title: e.target.value })}
    />
  );
}

function NotesDisplay({ notes }) {
  return (
    <div className="w-full h-full p-2 whitespace-pre-wrap">{notes || ""}</div>
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

function TaskRegion({ list }) {
  const [value, loading, error] = useCollection(
    collection(getDb(), "listsnew", list, "tasks")
  );

  return (
    <div className="flex grow gap-4 flex-col">
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
              list={list}
              repeating={false}
            />
          );
        })}
    </div>
  );
}

function TaskArea({ list }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border flex grow gap-4 flex-col p-5">
      <TaskRegion list={list} />
      {editing ? (
        <NewTask list={list} setEditing={setEditing} repeating={false} />
      ) : (
        <AddEntryButton onClick={() => setEditing(true)} />
      )}
    </div>
  );
}

function SubmissionContainer({ children }) {
  return <div className="flex justify-end gap-4 h-max">{children}</div>;
}

/* ============================================================================================= */
/* ===================================== OLD STUFF ============================================= */
/* ============================================================================================= */
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

// FIXME: Known issue https://github.com/react-grid-layout/react-draggable/issues/749
function List(props) {
  const [newTask, setNewTask] = useState("");
  if (!props.data.show) {
    return;
  }
  return (
    // I don't know why "body" works; it wasn't in the docs, but I found it in this example:
    // https://github.com/react-grid-layout/react-draggable/issues/535
    <Draggable bounds="body">
      <div className="menu bg-base-200 rounded-box w-[50vw] absolute top-auto left-auto">
        <h1>{props.data.name || `Untitled list ${props.id}`}</h1>
        <div className="menu">
          <ul className="menu">
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
            className="flex justify-between w-100 gap-2"
          >
            <input
              className="input w-full"
              type="text"
              value={newTask}
              onChange={(e) => {
                setNewTask(e.target.value);
              }}
            />
            <button type="submit" className="btn btn-circle btn-outline">
              <FontAwesomeIcon icon={faPlusCircle} size="xl" />
            </button>
          </form>
        </div>

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

export function ListsSpace(props) {
  return (
    <div className="w-full p-10">
      {props.error && <p>Error: {JSON.stringify(props.error)}</p>}
      {props.loading && <p>...</p>}
      {props.value &&
        props.value.docs.map((doc) => (
          <List key={doc.id} id={doc.id} data={doc.data()} />
        ))}
    </div>
  );
}
/* ============================================================================================= */
