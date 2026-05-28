import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faTrashCan,
  faEllipsisVertical,
  faThumbtack,
} from "@fortawesome/free-solid-svg-icons";

import {
  createTaskNew,
  updateTaskNew,
  deleteTaskNew,
  NOTES_PLACEHOLDER,
  setFocusedTask,
  TASK_FIELDS,
} from "./task-utils";
import { SaveButton, CancelButton, EditButton, DeleteButton } from "./Common";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { supabase } from "../supabase/client";

export function TaskNew({ data, initial, id, list }) {
  const [user] = useSupabaseAuth();
  const [editing, setEditing] = useState(initial ?? false);
  const [content, setContent] = useState(data ?? {});
  const [collapseOpen, setCollapseOpen] = useState(false);

  return (
    <div
      className={
        "collapse collapse-arrow w-full bg-base-100 border-base-300 border" +
        (collapseOpen ? " collapse-open" : "")
      }
    >
      <div
        className={"collapse-title font-semibold"}
        onClick={() => setCollapseOpen(!collapseOpen)}
      >
        <div className="flex flex-row gap-2">
          <input
            type="checkbox"
            checked={data.completed}
            className="checkbox"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={() => {
              updateTaskNew(user?.id, id, { completed: !data.completed });
            }}
          />
          <FontAwesomeIcon
            icon={faThumbtack}
            className={`p-2 rounded-full ${data.focus ? "text-gray-800" : "text-gray-300 active:text-gray-600 focus-within:text-gray-600 hover:text-gray-600"}`}
            onClick={(e) => {
              e.stopPropagation();
              setFocusedTask(user?.id, id, data.focus);
            }}
          />

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
      <form className="collapse-content text-sm flex flex-col gap-10">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col grow gap-4">
            <fieldset className="fieldset flex-1">
              <TimeArea
                content={content}
                setContent={setContent}
                editing={editing}
              />
            </fieldset>
            <fieldset className="fieldset">
              {/* <RepeatArea
                content={content}
                setContent={setContent}
                editing={editing}
              /> */}
            </fieldset>
            <fieldset className="flex flex-row gap-2 justify-start items-center">
              <EarnsLabel />
              {editing ? (
                <RewardsArea content={content} setContent={setContent} />
              ) : (
                <EarnsDisplay
                  rewardId={data.reward}
                  rewardCost={data.reward_cost}
                />
              )}
            </fieldset>
          </div>
          <fieldset className="fieldset flex-1 flex">
            {editing ? (
              <NotesInput content={content} setContent={setContent} />
            ) : (
              <NotesDisplay notes={data.notes} />
            )}
          </fieldset>
        </div>
        <div>
          <div>
            {editing ? (
              <SubmissionContainer>
                {/* <OverwriteDropdown setContent={setContent} /> */}
                <SaveButton
                  onSave={(e) => {
                    e.preventDefault();
                    updateTaskNew(user?.id, id, content);
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
                  onDelete={async () => {
                    await deleteTaskNew(user?.id, id);
                    setEditing(false);
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

export function NewTask({ userId, list, setEditing }) {
  const [content, setContent] = useState(TASK_FIELDS);
  const [collapseOpen, setCollapseOpen] = useState(true);

  return (
    <div
      className={
        "collapse collapse-arrow bg-base-100 border-base-300 border" +
        (collapseOpen ? " collapse-open" : "")
      }
    >
      <div
        className="collapse-title font-semibold"
        onClick={() => setCollapseOpen(!collapseOpen)}
      >
        <TitleInput content={content} setContent={setContent} />
      </div>
      <form className="collapse-content text-sm flex flex-col gap-10">
        <div className="flex flex-row gap-4">
          <div className="flex flex-col gap-4">
            <fieldset className="fieldset flex-1">
              <TimeArea
                content={content}
                setContent={setContent}
                editing={true}
              />
            </fieldset>
            {/* <fieldset className="fieldset">
              <RepeatArea
                content={content}
                setContent={setContent}
                editing={true}
              />
            </fieldset> */}
            <fieldset className="flex flex-row gap-2 justify-start items-center">
              <EarnsLabel />
              <RewardsArea content={content} setContent={setContent} />
            </fieldset>
          </div>
          <fieldset className="fieldset flex-1 flex">
            <NotesInput content={content} setContent={setContent} />
          </fieldset>
        </div>
        <div>
          <div>
            <SubmissionContainer>
              {/* <OverwriteDropdown setContent={setContent} /> */}
              <SaveButton
                onSave={(e) => {
                  e.preventDefault();
                  createTaskNew(userId, list, content);
                  setEditing(false);
                }}
              />
              <CancelButton
                onCancel={() => {
                  setContent(TASK_FIELDS);
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
  if (!content.time || Object.keys(content.time).length === 0) {
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
  // Provide default fields if content.time is missing or empty
  const timeData =
    content.time && Object.keys(content.time).length > 0
      ? content.time
      : { Target: "", Actual: "" };

  return (
    <>
      <li className="flex flex-row items-end gap-1">
        <ul className="flex-1">
          {Object.entries(timeData).map(([engagement, hour], i) => (
            <li className="list-row flex gap-1 items-end" key={i}>
              <HoursLabel label={engagement} />
              <HoursInput
                hour={hour}
                setHour={(e) =>
                  setContent({
                    ...content,
                    time: { ...timeData, [engagement]: e.target.value },
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

function HoursInput({ hour, setHour }) {
  return (
    <div>
      <input
        type="text"
        value={hour}
        onChange={setHour}
        className="input validator min-w-2 w-min"
      ></input>
    </div>
  );
}

function EarnsLabel({ label }) {
  return <div className="h-min w-min">{label ?? "Earns: "}</div>;
}

function EarnsDisplay({ rewardId, rewardCost }) {
  const [rewardName, setRewardName] = useState("");
  const [user] = useSupabaseAuth();

  useEffect(() => {
    if (rewardCost !== null && rewardCost !== undefined) {
      setRewardName(String(rewardCost));
      return;
    }

    if (!rewardId || !user?.id) {
      setRewardName("");
      return;
    }

    const fetchRewardName = async () => {
      const { data } = await supabase
        .from("store")
        .select("name")
        .eq("id", rewardId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setRewardName(data.name);
      }
    };

    fetchRewardName();
  }, [rewardId, rewardCost, user?.id]);

  return (
    <h1 className={"w-full h-full text-base"}>
      {rewardName || (rewardId ? "..." : "N/A")}
    </h1>
  );
}

function RewardsDropdown({ content, setContent }) {
  const [user] = useSupabaseAuth();
  const [rewards, setRewards] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchRewards = async () => {
      const { data } = await supabase
        .from("store")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      setRewards(data || []);
    };

    fetchRewards();
  }, [user?.id]);

  return (
    <select
      className="select select-bordered select-sm w-min"
      value={content.reward || ""}
      onChange={(e) =>
        setContent({ ...content, reward: e.target.value || null })
      }
    >
      <option value="">None</option>
      {rewards.map((reward) => (
        <option key={reward.id} value={reward.id}>
          {reward.name}
        </option>
      ))}
    </select>
  );
}

function RewardsArea({ content, setContent }) {
  const [isNumerical, setIsNumerical] = useState(
    content.reward_cost !== null && content.reward_cost !== undefined,
  );

  const toggleMode = (e) => {
    e.preventDefault();
    if (isNumerical) {
      // Switching to dropdown: clear cost
      setContent({ ...content, reward_cost: null });
    } else {
      // Switching to numerical: clear reward
      setContent({ ...content, reward: null });
    }
    setIsNumerical(!isNumerical);
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      {isNumerical ? (
        <input
          type="number"
          className="input input-bordered input-sm w-24"
          placeholder="Cost"
          value={content.reward_cost ?? ""}
          onChange={(e) =>
            setContent({
              ...content,
              reward_cost: e.target.value,
              reward: null,
            })
          }
        />
      ) : (
        <RewardsDropdown
          content={content}
          setContent={(updatedContent) =>
            setContent({ ...updatedContent, reward_cost: null })
          }
        />
      )}
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-circle"
        onClick={toggleMode}
        title={isNumerical ? "Switch to rewards list" : "Enter manual cost"}
      >
        <FontAwesomeIcon
          icon={faArrowRight}
          className={isNumerical ? "rotate-180" : ""}
        />
      </button>
    </div>
  );
}

// function RepeatArea({ content, setContent, editing }) {
//   const DAYS_ORDER = ["Su", "M", "Tu", "W", "Th", "F", "Sa"];
//   return (
//     <div>
//       <RepeatLabel label="Days " />
//       {DAYS_ORDER.map((day, i) => (
//         <RepeatButton
//           key={i}
//           text={day}
//           editing={editing}
//           repeat={content.repeats?.[day] ?? false}
//           toggleRepeat={() =>
//             setContent({
//               ...content,
//               repeats: { ...content.repeats, [day]: !content.repeats?.[day] },
//             })
//           }
//         />
//       ))}
//     </div>
//   );
// }

// function RepeatLabel({ label }) {
//   return <div className="flex-1 h-min">{label ?? ""}</div>;
// }

// function RepeatButton({ text, editing, repeat, toggleRepeat }) {
//   return (
//     <button
//       className={
//         "btn rounded-full" +
//         (repeat ? " bg-accent" : "") +
//         (editing ? " text-primary" : " text-neutral")
//       }
//       disabled={!editing}
//       onClick={(e) => {
//         e.preventDefault();
//         toggleRepeat();
//       }}
//     >
//       {text}
//     </button>
//   );
// }

function SubmissionContainer({ children }) {
  return <div className="flex justify-end gap-4 h-max">{children}</div>;
}

// function OverwriteDropdown({ setContent }) {
//   const [user] = useSupabaseAuth();
//   const [repeats, setRepeats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!user?.id) return;

//     let active = true;

//     const fetchRepeats = async () => {
//       const { data, error: err } = await supabase
//         .from("repeats")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("id", { ascending: true });

//       if (!active) return;

//       if (err) {
//         setError(err);
//       } else {
//         setRepeats(data);
//       }
//       setLoading(false);
//     };

//     fetchRepeats();

//     const subscription = supabase
//       .channel(`repeats:user_id=eq.${user.id}`)
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "repeats",
//           filter: `user_id=eq.${user.id}`,
//         },
//         () => fetchRepeats(),
//       )
//       .subscribe();

//     return () => {
//       active = false;
//       subscription.unsubscribe();
//     };
//   }, [user?.id]);

//   return (
//     <div className="dropdown dropdown-top">
//       <div tabIndex={0} role="button" className="btn btn-ghost rounded-full ">
//         <FontAwesomeIcon icon={faEllipsisVertical} />
//       </div>
//       <ul
//         tabIndex="-1"
//         className="dropdown-content menu bg-base-100 rounded-box z-0 w-52 p-0 shadow-sm"
//       >
//         <li>
//           <select
//             defaultValue=""
//             className="select w-min"
//             onChange={(e) => {
//               const choice = repeats?.find(
//                 (item) => String(item.id) === e.target.value,
//               );
//               if (choice) {
//                 setContent(choice);
//               }
//             }}
//           >
//             <option value="" disabled>
//               Replace with repeating template
//             </option>
//             {loading && <option disabled>Loading templates...</option>}
//             {repeats &&
//               repeats.map((repeat) => (
//                 <option key={repeat.id} value={repeat.id}>
//                   {repeat.title}
//                 </option>
//               ))}
//           </select>
//         </li>
//       </ul>
//       {error && <p className="text-error">Error loading templates.</p>}
//     </div>
//   );
// }
