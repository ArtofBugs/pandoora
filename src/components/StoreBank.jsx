import { useState } from "react";
import { supabase } from "../supabase/client";

async function useReward(id, amount, user_id, onSuccess) {
  try {
    const { data: current } = await supabase
      .from("store")
      .select("claimed")
      .eq("id", id)
      .single();

    await supabase
      .from("store")
      .update({ claimed: (current?.claimed || 0) - amount })
      .eq("id", id)
      .eq("user_id", user_id);

    if (onSuccess) onSuccess();
  } catch (e) {
    console.error("Error using reward:", e);
  }
}

function StoreBankCard(props) {
  if (!props.item.claimed) {
    return null;
  }
  const [toUse, setToUse] = useState(0);

  return (
    <div className="card bg-primary-content m-5">
      <div className="card-body p-10">
        <h3 className="card-title">{props.item.name}</h3>
        <p>Available: {props.item.claimed}</p>

        <div className="card-actions justify-end">
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <button
              className="card-actions flex flex-col btn p-2 w-fit"
              onClick={() => {
                toUse >= 0 &&
                  toUse <= props.item.claimed &&
                  useReward(
                    props.item.id,
                    toUse,
                    props.userId,
                    props.onUseSuccess,
                  );
              }}
            >
              <p>Use</p>
              <div className="w-full">
                <input
                  className="input input-bordered"
                  type="number"
                  id={props.item.id}
                  step={1}
                  min={0}
                  max={props.item.claimed}
                  value={toUse}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onChange={(e) => {
                    setToUse(e.target.value);
                  }}
                ></input>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function StoreBank(props) {
  if (!props.userId) {
    return <p>Please sign in to use the Store.</p>;
  }

  return (
    <div className="p-2 w-screen">
      <div className="rounded-lg bg-neutral-content p-4 w-full m-0">
        <h1 className="font-bold text-xl m-2 w-full">Earned Rewards</h1>
        <div className="w-full inline-flex flex-wrap">
          {props.error && <p>Error: {JSON.stringify(props.error)}</p>}
          {props.loading && <p>Loading...</p>}
          {props.data &&
            props.data.map((item) => (
              <StoreBankCard
                key={item.id}
                item={item}
                userId={props.userId}
                onUseSuccess={props.onUseSuccess}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
