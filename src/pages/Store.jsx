import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesLeft } from "@fortawesome/free-solid-svg-icons";

import StoreBank from "../components/StoreBank";
import StoreTable from "../components/StoreTable";

import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useSupabaseAuth } from "../supabase/useSupabaseAuth";
import { NavLink } from "react-router-dom";

export default function Store() {
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useSupabaseAuth(); // Use Supabase auth for Store

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
        setValue({
          docs: data.map((item) => ({ id: item.id, data: () => item })),
        });
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

  if (!user?.id) {
    return (
      <>
        <BackButton />
        <p>Please sign in to use the Store.</p>
      </>
    );
  }
  return (
    <>
      <BackButton />
      <StoreBank value={value} loading={loading} error={error} />
      <StoreTable value={value} loading={loading} error={error} />
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
