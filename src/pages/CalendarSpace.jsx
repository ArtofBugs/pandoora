import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { getPeriods } from "../components/calendar-utils";
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";

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
      .channel(`calendar-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calendar",
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
      <Calendar periods={periods} />
    </div>
  );
}

const Calendar = ({ periods }) => {
  return (
    <DayPilotCalendar
      events={periods.map((period) => ({
        id: period.id,
        text: period.title,
        start: period.start_time,
        end: period.end_time,
        backColor: period.type === "work" ? "blue" : "gold",
      }))}
      viewType="Week"
    />
  );
};
