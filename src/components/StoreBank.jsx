import { useState } from "react";
import { supabase } from "../supabase/client";

async function useReward(id, amount, userId) {
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
      .eq("user_id", userId);
  } catch (e) {
    console.error("Error using reward:", e);
  }
}

function StoreBankCard(props) {
  if (!props.data.claimed) {
    return null;
  }
  const [toUse, setToUse] = useState(0);

  return (
    <div className="card bg-primary-content w-30 m-5">
      <div className="card-body">
        <h3 className="card-title">{props.data.name}</h3>
        <p>Available: {props.data.claimed}</p>

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
                  toUse <= props.data.claimed &&
                  useReward(props.id, toUse, props.userId);
              }}
            >
              <p>Use</p>
              <div className="w-full">
                <input
                  className="input input-bordered"
                  type="number"
                  id={props.id}
                  step={1}
                  min={0}
                  max={props.data.claimed}
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
  if (!props.user?.id) {
    return <p>Please sign in to use the Store.</p>;
  }

  return (
    <div className="p-2 w-screen">
      <div className="rounded-lg bg-neutral-content p-4 w-full m-0">
        <h1 className="font-bold text-xl m-2 w-full">Bank</h1>
        <h2 className="w-full">Available to claim:</h2>
        <div className="w-full inline-flex flex-wrap">
          {props.error && <p>Error: {JSON.stringify(props.error)}</p>}
          {props.loading && <p>Loading...</p>}
          {props.value &&
            props.value.docs.map((doc) => (
              <StoreBankCard
                key={doc.id}
                id={doc.id}
                data={doc.data()}
                userId={props.user.id}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
