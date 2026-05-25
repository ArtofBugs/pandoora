import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

import StoreBank from "../components/StoreBank";
import StoreTable from "../components/StoreTable";

import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { NavLink } from "react-router-dom";

const TABLE = 1;
const BANK = 2;

export default function Store() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState(TABLE);
  const [user, authLoading, authError] = useSupabaseAuth();

  useEffect(() => {
    if (!user?.id) return;

    const fetchStoreData = async () => {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("store")
        .select("*")
        .eq("user_id", user.id);

      if (err) {
        setError(err);
      } else {
        setData(data);
      }
      setLoading(false);
    };

    fetchStoreData();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel(`store:user_id=eq.${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchStoreData(),
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, [user?.id]);

  if (authLoading) {
    return (
      <>
        <BackButton />
        <p>Loading...</p>
      </>
    );
  }

  if (!user?.id) {
    return (
      <>
        <BackButton />
        <p>Please sign in to use the Store.</p>
      </>
    );
  }
  if (loading) {
    return (
      <>
        <BackButton />
        <p>Loading...</p>
      </>
    );
  }
  if (error) {
    return (
      <>
        <BackButton />
        <p>Error: {JSON.stringify(error)}</p>
      </>
    );
  }
  return (
    <>
      <div className="flex justify-between items-center p-2">
        <BackButton />
        <div className="join">
          <button
            className={`btn btn-sm join-item ${view === TABLE ? "btn-active" : ""}`}
            onClick={() => setView(TABLE)}
          >
            Available
          </button>
          <button
            className={`btn btn-sm join-item ${view === BANK ? "btn-active" : ""}`}
            onClick={() => setView(BANK)}
          >
            Claimed
          </button>
        </div>
      </div>

      {view === BANK ? (
        <StoreBank
          data={data}
          userId={user.id}
          onUseSuccess={() => {
            const fetchStoreData = async () => {
              const { data: newData, error: err } = await supabase
                .from("store")
                .select("*")
                .eq("user_id", user.id);
              if (!err) setData(newData);
            };
            fetchStoreData();
          }}
        />
      ) : (
        <StoreTable
          data={data}
          userId={user.id}
          onAddSuccess={() => {
            const fetchStoreData = async () => {
              const { data: newData, error: err } = await supabase
                .from("store")
                .select("*")
                .eq("user_id", user.id);
              if (!err) setData(newData);
            };
            fetchStoreData();
          }}
          onDeleteSuccess={() => {
            const fetchStoreData = async () => {
              const { data: newData, error: err } = await supabase
                .from("store")
                .select("*")
                .eq("user_id", user.id);
              if (!err) setData(newData);
            };
            fetchStoreData();
          }}
          onClaimSuccess={() => {
            const fetchStoreData = async () => {
              const { data: newData, error: err } = await supabase
                .from("store")
                .select("*")
                .eq("user_id", user.id);
              if (!err) setData(newData);
            };
            fetchStoreData();
          }}
        />
      )}
    </>
  );
}

function BackButton() {
  return (
    <NavLink to="/tasks">
      <FontAwesomeIcon icon={faAnglesLeft} /> Back to Tasks
    </NavLink>
  );
}
