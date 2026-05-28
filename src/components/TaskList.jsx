import { useEffect, useState } from "react";

import { TaskNew, NewTask } from "./Task";
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

import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { supabase } from "../supabase/client";

export function TaskListNew({ data, initial, id, userId }) {
  const [editing, setEditing] = useState(initial ?? false);
  const [content, setContent] = useState(data ?? {});
  const [collapseOpen, setCollapseOpen] = useState(false);

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
        <div className="flex flex-col gap-1">
          <fieldset className="fieldset flex-1 flex">
            {editing ? (
              <NotesInput content={content} setContent={setContent} />
            ) : (
              <NotesDisplay notes={data.notes} />
            )}
          </fieldset>
          <div className="fieldset flex-1">
            <TaskArea userId={userId} list={id} />
          </div>
        </div>
        {editing ? (
          <SubmissionContainer>
            <SaveButton
              onSave={() => {
                updateTaskList(userId, id, content);
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
                deleteTaskList(userId, id);
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

export function NewTaskList({ userId, setEditing }) {
  const [content, setContent] = useState({ title: "", notes: "" });
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
      <div className="collapse-content text-sm flex flex-col gap-4 h-max">
        <div className="flex flex-col gap-10">
          <fieldset className="fieldset flex-1 flex">
            <NotesInput content={content} setContent={setContent} />
          </fieldset>
        </div>
        <div>
          <SubmissionContainer>
            <SaveButton
              onSave={(e) => {
                e.preventDefault();
                createTaskList(userId, content);
                setEditing(false);
              }}
            />
            <CancelButton
              onCancel={() => {
                setContent({ title: "", notes: "" });
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
  const [user] = useSupabaseAuth();
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id || !list) {
      return;
    }

    let active = true;

    const fetchTasks = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("tasks")
        .select("*, lists ( id )")
        .eq("user_id", user.id)
        .eq("lists.id", list)
        .order("id", { ascending: true });

      if (!active) {
        return;
      }

      if (err) {
        setError(err);
      } else {
        setTasks(data ?? []);
      }
      setLoading(false);
    };

    fetchTasks();

    const relationshipSubscription = supabase
      .channel(`list_task_relationships:list=eq.${list}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "list_task_relationships",
          filter: `list=eq.${list}`,
        },
        () => fetchTasks(),
      )
      .subscribe();

    const taskSubscription = supabase
      .channel(`tasks:user_id=eq.${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchTasks(),
      )
      .subscribe();

    return () => {
      active = false;
      relationshipSubscription.unsubscribe();
      taskSubscription.unsubscribe();
    };
  }, [user?.id, list]);

  return (
    <div className="flex grow gap-4 flex-col">
      {error && <p>Error: {JSON.stringify(error)}</p>}
      {loading && <p>...</p>}
      {tasks &&
        tasks.map(({ lists, ...taskData }) => (
          <TaskNew
            key={taskData.id}
            id={taskData.id}
            data={taskData}
            initial={false}
            list={list}
            repeating={false}
            onDeleteSuccess={() => {
              const fetchTasks = async () => {
                setLoading(true);
                const { data, error: err } = await supabase
                  .from("tasks")
                  .select("*, lists ( id )")
                  .eq("user_id", user.id)
                  .eq("lists.id", list)
                  .order("id", { ascending: true });
                if (!err) setTasks(data ?? []);
              };
              fetchTasks();
            }}
          />
        ))}
    </div>
  );
}

function TaskArea({ userId, list }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="border flex grow gap-4 flex-col p-5">
      <TaskRegion list={list} />
      {editing ? (
        <NewTask
          userId={userId}
          list={list}
          setEditing={setEditing}
          repeating={false}
        />
      ) : (
        <AddEntryButton onClick={() => setEditing(true)} />
      )}
    </div>
  );
}

function SubmissionContainer({ children }) {
  return <div className="flex justify-end gap-4 h-max">{children}</div>;
}
