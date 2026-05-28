import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { getPeriods } from "../components/calendar-utils";

export default function CalendarSpace() {
  const [user, authLoading, authError] = useSupabaseAuth();
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      setPeriods([]);
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadPeriods() {
      setLoading(true);
      const { data, error } = await getPeriods(user.id);

      if (!mounted) return;

      if (error) {
        setError(error);
      } else {
        setPeriods(data || []);
      }

      setLoading(false);
    }

    loadPeriods();

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
          const { data, error } = await getPeriods(user.id);
          if (!error) {
            setPeriods(data || []);
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
      {activeError && <p>Error: {JSON.stringify(activeError)}</p>}
      {(authLoading || loading) && <p>...</p>}
    </div>
  );
}
