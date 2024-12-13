import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { updateTask } from "./update-utils";

// TODO: Should id props be renamed to something else?
export function TaskPopup(props) {
  const [name, setName] = useState(
    props.data.name || "Untitled task " + props.id
  );
  const [description, setDescription] = useState(props.data.description || "");
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
        </div>
        <div className="card-actions">
          <button
            className="btn"
            onClick={() => {
              updateTask(props.id, "name", name, "text");
              updateTask(props.id, "description", description, "text");
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
