import { useState } from "react";

import {
  createLogEntry,
  updateLogEntry,
  deleteLogEntry,
  TOTAL_HOURS,
  BUDGET_FIELDS,
  NOTES_PLACEHOLDER,
} from "./log-utils";

import { SaveButton, CancelButton, EditButton, DeleteButton } from "./Common";

export function LogEntry({ data, initial, id }) {
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
          {/* Notes */}
          <fieldset className="fieldset flex-1 flex">
            {editing ? (
              <NotesInput content={content} setContent={setContent} />
            ) : (
              <NotesDisplay notes={data.notes} />
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
              <DeleteButton
                onDelete={() => {
                  deleteLogEntry(id);
                }}
              />
            </SubmissionContainer>
          ) : (
            <div />
          )}
        </div>
      </form>
    </div>
  );
}

export function NewLogEntry({ setEditing }) {
  const [content, setContent] = useState({ budget: BUDGET_FIELDS });
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
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => setContent({ ...content, title: e.target.value })}
    />
  );
}

function NotesDisplay({ notes }) {
  return (
    <div className="w-full h-full p-2 border whitespace-pre-wrap">
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
        <HoursLabel label="Total hours in day" />
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
        <HoursLabel label="Total hours in day" />
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
  return <p className="">{hour}</p>;
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
