import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { updateTask } from "./update-utils";

import { collection } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

import getDb, { auth } from "../firebase/initialize";

// TODO: Allow assigning a quantity of rewards for a task
// TODO: Allow claiming rewards from the task popup
function RewardsMenu(props) {
  const [user, _, __] = useAuthState(auth);
  const [value, loading, error] = useCollection(
    collection(getDb(), "users", user?.uid, "store")
  );
  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text">Assigned reward</span>
      </div>
      {error && <option disabled>Error: {JSON.stringify(error)}</option>}
      {loading && <option disabled>...</option>}
      {value && (
        <select
          className="select"
          defaultValue={
            value.docs.find((doc) => doc.id == props.reward)?.data().name ||
            "None"
          }
        >
          {
            <option
              onClick={() => {
                props.setReward("");
                setSelected("None");
              }}
            >
              None
            </option>
          }
          {value.docs.map((doc) => (
            <option
              key={`rewards_menu_${doc.id}`}
              className="btn"
              onClick={() => {
                props.setReward(doc.id);
              }}
            >
              {doc.data().name || `Untitled reward ${doc.id}`}
            </option>
          ))}
        </select>
      )}
    </label>
  );
}

// TODO: Should id props be renamed to something else?
// TODO: Investigate using formData instead of individual states
export function TaskPopup(props) {
  const [name, setName] = useState(
    props.data.name || "Untitled task " + props.id
  );
  const [estTime, setEstTime] = useState(props.data.estTime || "");
  const [actTime, setActTime] = useState(props.data.actTime || "");
  const [description, setDescription] = useState(props.data.description || "");
  const [reward, setReward] = useState(props.data.reward || "");
  // Text decoration goes to children too, according to
  // https://github.com/tailwindlabs/tailwindcss/discussions/3836,
  // so reset it
  return (
    <>
      <span
        className="modal-box card fixed z-20"
        onClick={(e) => {
          e.preventDefault();
        }}
      >
        <h3 className="no-underline card-title">Modal content</h3>
        <div className="card-body">
          <label
            htmlFor="edit-name"
            className="input input-bordered flex items-center gap-2 w-full"
          >
            Task name
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label
            htmlFor="edit-est-time"
            className="input input-bordered flex items-center gap-2 w-full"
          >
            Estimated time
            <input
              id="edit-est-time"
              type="text"
              value={estTime}
              onChange={(e) => setEstTime(e.target.value)}
            />
          </label>
          <label
            htmlFor="edit-act-time"
            className="input input-bordered flex items-center gap-2 w-full"
          >
            Actual time taken
            <input
              id="edit-act-time"
              type="text"
              value={actTime}
              onChange={(e) => setActTime(e.target.value)}
            />
          </label>
          <label className="form-control">
            <div className="label">
              <span className="label-text">Notes</span>
            </div>
            <textarea
              id="task-description"
              className="textarea w-full"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </label>
          <RewardsMenu id={props.id} reward={reward} setReward={setReward} />
        </div>
        <div className="card-actions">
          <button
            className="btn"
            onClick={() => {
              updateTask(props.id, "name", name, "text");
              updateTask(props.id, "estTime", estTime, "text");
              updateTask(props.id, "actTime", actTime, "text");
              updateTask(props.id, "description", description, "text");
              updateTask(props.id, "reward", reward, "text");
              console.log("modal edit saved");
              props.setShowPopup(false);
            }}
          >
            Save
          </button>
          <button
            className="btn"
            onClick={() => {
              console.log("modal edit canceled");
              props.setShowPopup(false);
            }}
          >
            Cancel
          </button>
        </div>
      </span>
      <span className="rounded-lg opacity-70 bg-black z-10 fixed w-full h-full top-0 left-0"></span>
    </>
  );
}

export default function TaskPopupButton(props) {
  const [showPopup, setShowPopup] = useState(false);
  return (
    <>
      <button
        className="btn btn-circle"
        onClick={() => {
          console.log("modal opened ");
          setShowPopup(true);
          console.log(showPopup);
        }}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </button>
      {showPopup && (
        <TaskPopup
          data={props.data}
          id={props.id}
          showPopup={showPopup}
          setShowPopup={setShowPopup}
        />
      )}
    </>
  );
}
