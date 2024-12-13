import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import Draggable from "react-draggable";

import Task from "./Task";

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

import getDb from "../firebase/initialize";

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

export default function ListsSpace(props) {
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
