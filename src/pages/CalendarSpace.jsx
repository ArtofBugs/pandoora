import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { getPeriods, updatePeriod } from "../components/calendar-utils";
import { DayPilotCalendar } from "@daypilot/daypilot-lite-react";
import { NewPeriodModal } from "../components/NewPeriodModal"; // Import the new modal component

export default function CalendarSpace() {
  const [user, authLoading, authError] = useSupabaseAuth();
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false); // This state is not used in the original code, but kept for consistency if needed later.

  // State for the new modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialStart, setModalInitialStart] = useState(null);
  const [modalInitialEnd, setModalInitialEnd] = useState(null);

  const loadPeriods = useCallback(async () => {
    if (!user) {
      setPeriods([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: fetchError } = await getPeriods(user.id);
    if (fetchError) {
      setError(fetchError);
    } else {
      setPeriods(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadPeriods();
  }, [user, loadPeriods]);

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
        () => loadPeriods(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadPeriods]);

  const activeError = authError || error;

  const handleTimeRangeSelected = (args) => {
    setModalInitialStart(args.start.toDate());
    setModalInitialEnd(args.end.toDate());
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalInitialStart(null);
    setModalInitialEnd(null);
  };

  const handleEventMoved = useCallback(async (args) => {
    // The actual update logic will be in the Calendar component itself
  }, []);

  return (
    <div className="flex grow gap-4 flex-col pl-10 pr-10">
      {activeError && <p>Error: {JSON.stringify(activeError)}</p>}
      {(authLoading || loading) && <p>...</p>}
      <Calendar
        periods={periods}
        setPeriods={setPeriods}
        onTimeRangeSelected={handleTimeRangeSelected}
      />
      {user && (
        <NewPeriodModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          initialStart={modalInitialStart}
          initialEnd={modalInitialEnd}
          userId={user.id}
          onPeriodAdded={loadPeriods}
        />
      )}
    </div>
  );
}

const Calendar = ({ periods, setPeriods, onTimeRangeSelected }) => {
  const [user, authLoading, authError] = useSupabaseAuth();

  const handleEventMoved = async (args) => {
    if (!user) {
      console.error("User not authenticated.");
      return;
    }

    // Optimistic UI update:
    // Update local state immediately so the calendar doesn't "jump" back
    // while waiting for the database and realtime notification.
    setPeriods((prev) =>
      prev.map((period) =>
        period.id === args.e.id()
          ? {
              ...period,
              start_time: args.newStart.toDate().toISOString(),
              end_time: args.newEnd.toDate().toISOString(),
            }
          : period,
      ),
    );

    const result = await updatePeriod(
      args.e.id(),
      args.newStart.toDate().toISOString(),
      args.newEnd.toDate().toISOString(),
    );
  };

  const handleEventResized = async (args) => {
    if (!user) return;

    // Optimistic UI update:
    // Update local state immediately so the calendar doesn't "jump" back
    // while waiting for the database and realtime notification.
    setPeriods((prev) =>
      prev.map((period) =>
        period.id === args.e.id()
          ? {
              ...period,
              start_time: args.newStart.toDate().toISOString(),
              end_time: args.newEnd.toDate().toISOString(),
            }
          : period,
      ),
    );

    const result = await updatePeriod(
      args.e.id(),
      args.newStart.toDate().toISOString(),
      args.newEnd.toDate().toISOString(),
    );
    if (result) {
      console.log("Period resized successfully:", result);
    }
  };

  return (
    <DayPilotCalendar
      events={periods.map((period) => ({
        id: period.id,
        text: period.title,
        start: period.start_time,
        end: period.end_time,
        backColor: period.type === "work" ? "lightblue" : "gold",
      }))}
      viewType="Week"
      onTimeRangeSelected={onTimeRangeSelected} // Add the event handler
      timeRangeSelectedHandling="Enabled" // Enable time range selection
      eventMoveHandling="Update" // Enable event dragging
      onEventMoved={handleEventMoved} // Handle event move
      eventResizeHandling="Update" // Enable event resizing
      onEventResized={handleEventResized} // Handle event resize
    />
  );
};
