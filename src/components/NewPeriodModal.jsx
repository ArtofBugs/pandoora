import React, { useState, useEffect } from "react";
import { supabase } from "../supabase/client"; // Assuming supabase client is accessible here

export function NewPeriodModal({
  isOpen,
  onClose,
  initialStart,
  initialEnd,
  userId,
  onPeriodAdded,
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("work"); // Default to 'work'
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // format a Date (or date-like) into a value suitable for <input type="datetime-local">
  const formatForInput = (d) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(
      dt.getDate(),
    )}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  useEffect(() => {
    if (isOpen) {
      // populate inputs in the user's local timezone (datetime-local expects local)
      setTitle("");
      setType("work");
      setStartTime(initialStart ? formatForInput(initialStart) : "");
      setEndTime(initialEnd ? formatForInput(initialEnd) : "");
      setError(null);
      setLoading(false);
    }
  }, [isOpen, initialStart, initialEnd]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const newPeriod = {
      user_id: userId,
      title,
      type,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
    };

    const { data, error: supabaseError } = await supabase
      .from("calendar")
      .insert([newPeriod]);

    setLoading(false);

    if (supabaseError) {
      setError(supabaseError.message);
    } else {
      onPeriodAdded();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Add New Period</h2>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Title:
            </label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="type"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Type:
            </label>
            <select
              id="type"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="work">Work</option>
              <option value="break">Break</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="start_time"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Start Time:
            </label>
            <input
              type="datetime-local"
              id="start_time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="end_time"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              End Time:
            </label>
            <input
              type="datetime-local"
              id="end_time"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-cyan-400 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Period"}
            </button>
            <button
              type="button"
              className="bg-gray-400 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
