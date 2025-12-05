import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrashCan } from "@fortawesome/free-solid-svg-icons";

import {
  createLogEntry,
  updateLogEntry,
  TOTAL_HOURS,
  BUDGET_FIELDS,
} from "./log-utils";

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
      {/* Header */}
      <div className="collapse-title font-semibold">
        {/* Title */}
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
      {/* Content */}
      <form className="collapse-content text-sm flex flex-col gap-10">
        <div className="flex flex-row gap-10">
          {/* Budget */}
          <fieldset className="fieldset flex-1">
            <BudgetArea
              content={content}
              setContent={setContent}
              editing={editing}
            />
          </fieldset>
          {/* Description */}
          <fieldset className="fieldset flex-1">
            {editing ? (
              <DescriptionInput content={content} setContent={setContent} />
            ) : (
              <DescriptionDisplay description={data.description} />
            )}
          </fieldset>
        </div>
        {/* Buttons */}
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
  const [content, setContent] = useState({ budget: BUDGET_FIELDS });

  return (
    <div className="collapse collapse-arrow collapse-open bg-base-100 border-base-300 border">
      <input type="checkbox" />
      <div className="collapse-title font-semibold">
        <TitleInput content={content} setContent={setContent} />
      </div>
      <div className="collapse-content text-sm flex flex-col gap-4 h-max">
        <div className="flex flex-row gap-10">
          {/* Budget */}
          <fieldset className="fieldset flex-1">
            <BudgetArea
              content={content}
              setContent={setContent}
              editing={true}
            />
          </fieldset>
          {/* Description */}
          <fieldset className="fieldset flex-1">
            <DescriptionInput content={content} setContent={setContent} />
          </fieldset>
        </div>
        {/* Buttons */}
        <div>
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

function BudgetArea({ editing, content, setContent }) {
  return (
    <ul className="list">
      <li className="tracking-wide font-extrabold">Time Budget</li>
      {editing ? (
        <BudgetInput content={content} setContent={setContent} />
      ) : (
        <BudgetDisplay content={content} />
      )}
    </ul>
  );
}

function BudgetDisplay({ content }) {
  if (!content.budget) {
    return <div />;
  }
  let total = TOTAL_HOURS;
  for (const hour of Object.values(content.budget)) {
    total -= Number(hour);
    console.log("subtracted", hour);
  }
  return (
    <>
      <li className="list-row flex font-bold gap-1">
        <HoursLabel label="Total hours in week" />
        <HoursDisplay hour={TOTAL_HOURS} />
      </li>
      <li className="flex flex-row items-end gap-1">
        <div className="font-extrabold h-min">-</div>
        <ul className="flex-1">
          {Object.entries(content.budget).map(([engagement, hour], i) => (
            <li className="list-row flex gap-1" key={i}>
              <HoursLabel label={engagement} />
              <HoursDisplay hour={hour} />
            </li>
          ))}
        </ul>
      </li>
      <li className="list-row">
        <hr></hr>
      </li>
      <li className="list-row font-extrabold flex gap-1">
        <HoursLabel label="Remaining" />
        <HoursDisplay hour={total} />
      </li>
    </>
  );
}

function BudgetInput({ content, setContent }) {
  if (!content.budget) {
    return <div />;
  }
  let total = TOTAL_HOURS;
  for (const hour of Object.values(content.budget)) {
    total -= Number(hour);
    console.log("subtracted", hour);
  }
  return (
    <>
      <li className="list-row flex font-bold gap-1">
        <HoursLabel label="Total hours in week" />
        <HoursDisplay hour={TOTAL_HOURS} />
      </li>
      <li className="flex flex-row items-end gap-1">
        <div className="font-extrabold h-min">-</div>
        <ul className="flex-1">
          {Object.entries(content.budget).map(([engagement, hour], i) => (
            <li className="list-row flex gap-1 items-end" key={i}>
              <HoursLabel label={engagement} />
              <HoursInput
                hour={hour}
                setHour={(e) =>
                  setContent({
                    ...content,
                    budget: { ...content.budget, [engagement]: e.target.value },
                  })
                }
              />
            </li>
          ))}
        </ul>
      </li>
      <li className="list-row">
        <hr></hr>
      </li>
      <li className="list-row font-extrabold flex gap-1">
        <HoursLabel label="Remaining" />
        <HoursDisplay hour={total} />
      </li>
      {/* {Object.entries(content.budget).map(([engagement, hour], i) => (
        <li className="list-row flex justify-items-center" key={i}>
          <HoursLabel label={engagement} />
          <HoursInput
            className="w-full"
            hour={hour}
            setHour={(e) =>
              setContent({
                ...content,
                budget: { ...content.budget, [engagement]: e.target.value },
              })
            }
          />
        </li>
      ))} */}
    </>
  );
}

function HoursLabel({ label }) {
  return <div className="flex-1 h-min">{label || ""}</div>;
}

function HoursDisplay({ hour }) {
  return <p className="">{hour || ""}</p>;
}

function HoursInput({ hour, setHour, hint }) {
  return (
    <div>
      <input
        type="number"
        value={hour}
        onChange={setHour}
        className="input validator w-full"
      ></input>
      {/* <div className="validator-hint">{hint || "Invalid value."}</div> */}
    </div>
  );
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
