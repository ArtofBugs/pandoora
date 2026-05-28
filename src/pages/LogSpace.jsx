import { useEffect, useState } from "react";
import { LogEntry, NewLogEntry } from "../components/LogEntry";
import AddEntryButton from "../components/Common";
import { supabase } from "../supabase/client";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { getLogEntries } from "../components/log-utils";

export default function LogSpace() {
  const [user, authLoading, authError] = useSupabaseAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadEntries() {
      setLoading(true);
      const { data, error } = await getLogEntries(user.id);

      if (!mounted) return;

      if (error) {
        setError(error);
      } else {
        setEntries(data || []);
      }

      setLoading(false);
    }

    loadEntries();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`log-user-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "log",
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          const { data, error } = await getLogEntries(user.id);
          if (!error) {
            setEntries(data || []);
          } else {
            setError(error);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const activeError = authError || error;

  return (
    <div className="flex grow gap-4 flex-col pl-10 pr-10">
      {editing ? (
        <NewLogEntry data={{}} setEditing={setEditing} />
      ) : (
        <AddEntryButton onClick={() => setEditing(true)} />
      )}
      {activeError && <p>Error: {JSON.stringify(activeError)}</p>}
      {(authLoading || loading) && <p>...</p>}
      {entries.map((entry) => (
        <LogEntry key={entry.id} id={entry.id} data={entry} initial={false} />
      ))}
    </div>
  );
}
