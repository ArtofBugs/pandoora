import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";

import { createLogEntry, updateLogEntry } from "./log-utils";

export function LogEntry({ data, initial, id }) {
  const [editing, setEditing] = useState(initial ?? false); // set false if undefined
  const [content, setContent] = useState(data ?? {});
  console.log(editing);
  console.log("content");
  console.log(content);
  console.log("data");
  console.log(data);

  // Don't show anything if empty
  // if (!editing && !content.title && !content.description) {
  //   console.log("Not showing");
  //   return;
  // }

  return (
    <div className="collapse collapse-arrow bg-base-100 border-base-300 border">
      <input type="checkbox" />
      <div className="collapse-title font-semibold">
        {editing ? (
          <TitleInput content={content} setContent={setContent} />
        ) : (
          <div className="flex">
            <div className="flex-1">
              <TitleDisplay title={data.title} />
            </div>
            <div className="flex-none">
              <EditButton setEditing={setEditing} />
            </div>
          </div>
        )}
      </div>
      <form className="collapse-content text-sm flex flex-col">
        {editing ? (
          <DescriptionInput content={content} setContent={setContent} />
        ) : (
          <DescriptionDisplay description={data.description} />
        )}
        <div>
          {editing ? (
            <SubmissionContainer>
              <SaveButton
                onSave={() => {
                  updateLogEntry(id, content);
                  setEditing(false);
                }}
              />
              <CancelButton
                onCancel={() => {
                  setEditing(false);
                }}
              />
              <DeleteButton />
            </SubmissionContainer>
          ) : (
            <div />
          )}
        </div>
      </form>
    </div>
  );
}

export function NewLogEntry({ data, setEditing }) {
  const [content, setContent] = useState(data ?? {});

  return (
    <div className="collapse collapse-arrow collapse-open bg-base-100 border-base-300 border">
      <input type="checkbox" />
      <div className="collapse-title font-semibold">
        <TitleInput content={content} setContent={setContent} />
      </div>
      <div className="collapse-content text-sm flex flex-col gap-4 h-max">
        <DescriptionInput content={content} setContent={setContent} />
        <SubmissionContainer>
          <SaveButton
            onSave={(e) => {
              e.preventDefault();
              createLogEntry(content);
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
  );
}

function TitleDisplay({ title }) {
  return <h1 className="w-full">{title || "Untitled Entry"}</h1>;
}

function TitleInput({ content, setContent }) {
  return (
    <input
      className="input input-bordered w-full"
      placeholder="Title"
      value={(content && content.title) || ""}
      onChange={(e) => setContent({ ...content, title: e.target.value })}
    />
  );
}

function DescriptionDisplay({ description }) {
  return <p className="w-full">{description || ""}</p>;
}

function DescriptionInput({ content, setContent }) {
  return (
    <textarea
      className="textarea textarea-neutral w-full"
      placeholder="Description"
      value={(content && content.description) || ""}
      onChange={(e) => setContent({ ...content, description: e.target.value })}
    />
  );
}

function BudgetContainer({ content, setContent }) {
  let budget = content.budget;
  const [sleep, setSleep] = useState(content.budget.sleep);
  return (
    <form>
      <HoursInput hour={budget.sleep} setContent={setSleep} />
    </form>
  );
}

function HoursInput({ hour, setHour }) {
  return <input type="number" value={hour} onChange={setHour(hour)}></input>;
}

function SubmissionContainer({ children }) {
  return <div className="flex justify-end gap-4 h-max">{children}</div>;
}

function SaveButton({ onSave }) {
  return (
    <button className="btn" onClick={onSave}>
      Save
    </button>
  );
}

function CancelButton({ onCancel }) {
  return (
    <button className="btn" onClick={onCancel}>
      Cancel
    </button>
  );
}

function EditButton({ setEditing }) {
  return (
    <button>
      <FontAwesomeIcon
        icon={faPencil}
        className="text-gray-500"
        onClick={() => setEditing(true)}
      />
    </button>
  );
}

function DeleteButton() {
  return (
    <button>
      <FontAwesomeIcon icon={faTrashCan} className="text-gray-500" />
    </button>
  );
}
