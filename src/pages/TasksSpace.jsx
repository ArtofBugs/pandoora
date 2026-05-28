import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { NewTaskList, TaskListNew } from "../components/TaskList";
import AddEntryButton from "../components/Common";

import { supabase } from "../supabase/client";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";

export default function TasksSpace() {
  const [user, authLoading, authError] = useSupabaseAuth();
  const [lists, setLists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchLists = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("lists")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: true });

      if (err) {
        setError(err);
      } else {
        setLists(data);
      }
      setLoading(false);
    };

    fetchLists();

    const subscription = supabase
      .channel(`lists:user_id=eq.${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lists",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchLists(),
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user?.id]);

  if (authLoading) {
    return <p>Loading...</p>;
  }

  if (!user?.id) {
    return (
      <div className="m-10">
        <p>Please sign in to see your tasks.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 flex-col ml-10 mr-10">
        {editing ? (
          <NewTaskList userId={user.id} setEditing={setEditing} />
        ) : (
          <AddEntryButton onClick={() => setEditing(true)} />
        )}
        {error && <p>Error: {JSON.stringify(error)}</p>}
        {loading && <p>...</p>}
        {lists &&
          lists.map((list) => (
            <TaskListNew
              key={list.id}
              id={list.id}
              userId={user.id}
              data={list || {}}
              initial={false}
              repeating={true}
            />
          ))}
      </div>
      <div className="flex justify-between m-10">
        <RepeatsLink />
        <StoreLink />
      </div>
    </div>
  );
}

function RepeatsLink() {
  return (
    <NavLink to="/repeats">
      <button className="btn border-gray-200 text-gray-800 font-normal">
        Switch to repeating tasks view
      </button>
    </NavLink>
  );
}

function StoreLink() {
  return (
    <div className="link link-hover">
      <NavLink to="/store">To store &gt;&gt;</NavLink>
    </div>
  );
}
