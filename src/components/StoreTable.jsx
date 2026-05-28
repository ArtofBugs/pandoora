import { useState } from "react";
import { supabase } from "../supabase/client";

async function addStore(name, price, quantity, user_id, onSuccess) {
  try {
    const { error, status } = await supabase.from("store").insert({
      user_id: user_id,
      name: name,
      price: Number(price),
      available: Number(quantity),
      claimed: 0,
    });

    if (error) return { error, status };

    if (onSuccess) onSuccess();
    return null;
  } catch (e) {
    console.error("Error adding item:", e);
    return { error: e, status: 500 };
  }
}

async function updateStore(id, field, content, type, user_id, onSuccess) {
  if (type === "number") {
    content = Number(content);
  }
  try {
    await supabase
      .from("store")
      .update({ [field]: content })
      .eq("id", id)
      .eq("user_id", user_id);
    if (onSuccess) onSuccess();
  } catch (e) {
    console.error("Error updating item:", e);
  }
}

async function deleteStore(id, user_id, onSuccess) {
  try {
    await supabase.from("store").delete().eq("id", id).eq("user_id", user_id);
    if (onSuccess) onSuccess();
  } catch (e) {
    console.error("Error deleting item:", e);
  }
}

async function claimStore(id, amount, user_id, onSuccess) {
  try {
    const { data: current } = await supabase
      .from("store")
      .select("claimed, available")
      .eq("id", id)
      .single();

    await supabase
      .from("store")
      .update({
        claimed: (current?.claimed || 0) + Number(amount),
        available: (current?.available || 0) - Number(amount),
      })
      .eq("id", id)
      .eq("user_id", user_id);

    if (onSuccess) onSuccess();
  } catch (e) {
    console.error("Error claiming reward:", e);
  }
}

function EditableCell(props) {
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(
    props.content || props.default_value || (props.type === "number" ? 0 : ""),
  );

  return (
    <td
      onDoubleClick={() => {
        setEditing(true);
        setContent(props.content);
      }}
      onBlur={(e) => {
        if (e.target.checkValidity?.() !== false) {
          setEditing(false);
          updateStore(props.id, props.field, content, props.type, props.userId);
        }
      }}
    >
      {editing ? (
        <input
          autoFocus
          className="input input-bordered m-0"
          id={props.id}
          min={props.min}
          step={props.step}
          max={props.max}
          type={props.type}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
          }}
        />
      ) : (
        <p className="text-left text-wrap">{props.content}</p>
      )}
    </td>
  );
}

function StoreRow(props) {
  const [toClaim, setToClaim] = useState(0);

  return (
    <tr className="table-row hover">
      <EditableCell
        id={props.id}
        field="name"
        type="text"
        content={props.item.name || `Untitled reward ${props.id}`}
        userId={props.userId}
      />
      <EditableCell
        id={props.id}
        min={0}
        step={1}
        field="price"
        type="number"
        content={props.item.price}
        userId={props.user_id}
      />
      <EditableCell
        id={props.id}
        min={0}
        step={1}
        field="available"
        type="number"
        content={props.item.available}
        userId={props.user_id}
      />
      <td>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <button
            className="btn"
            htmlFor={props.id}
            onClick={() => {
              toClaim >= 0 &&
                toClaim <= props.item.available &&
                claimStore(
                  props.id,
                  toClaim,
                  props.userId,
                  props.onClaimSuccess,
                );
            }}
          >
            Claim
            <input
              className="input input-bordered w-min"
              type="number"
              id={props.id}
              step={1}
              min={0}
              max={props.item.available}
              value={toClaim}
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
              }}
              onChange={(e) => {
                setToClaim(e.target.value);
              }}
            />
          </button>
        </form>
      </td>
      <th>
        <button
          className="btn btn-ghost btn-xs text-red-700"
          onClick={() =>
            deleteStore(props.id, props.userId, props.onDeleteSuccess)
          }
        >
          delete
        </button>
      </th>
    </tr>
  );
}

export default function StoreTable(props) {
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  if (!props.userId) {
    return <p>Please sign in to use the Store.</p>;
  }

  return (
    <div className="w-screen p-2">
      <h1 className="font-bold text-xl w-full">Available Rewards</h1>
      {errorMsg && (
        <div className="alert alert-error mb-4 shadow-lg flex justify-between">
          <span>{errorMsg}</span>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setErrorMsg("")}
          >
            ✕
          </button>
        </div>
      )}
      <table className="table w-full">
        <thead>
          <tr>
            <th className="w-60">Name</th>
            <th className="w-10">Price</th>
            <th className="w-10">Quantity remaining</th>
            <th className="w-10" />
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {props.error && (
            <tr>
              <td>Error: {JSON.stringify(props.error)}</td>
            </tr>
          )}
          {props.loading && (
            <tr>
              <td>Loading...</td>
            </tr>
          )}
          {props.data &&
            props.data.map((item) => (
              <StoreRow
                key={item.id}
                id={item.id}
                item={item}
                userId={props.userId}
                onDeleteSuccess={props.onDeleteSuccess}
                onClaimSuccess={props.onClaimSuccess}
              />
            ))}
        </tbody>

        <tfoot>
          <tr>
            <td>
              <input
                className="input input-bordered"
                type="text"
                placeholder="Name"
                form="storeAddForm"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                }}
              ></input>
            </td>
            <td>
              <input
                className="input input-bordered"
                type="number"
                min={0}
                placeholder="Price"
                form="storeAddForm"
                value={newPrice}
                onChange={(e) => {
                  setNewPrice(e.target.value);
                }}
              ></input>
            </td>
            <td colSpan={3}>
              <form
                id="storeAddForm"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <button
                  className="btn"
                  htmlFor="storeAdd"
                  type="submit"
                  onClick={async () => {
                    setErrorMsg("");
                    if (newQuantity >= 0) {
                      const res = await addStore(
                        newName,
                        newPrice,
                        newQuantity,
                        props.userId,
                        () => {
                          setNewName("");
                          setNewPrice(0);
                          setNewQuantity(0);
                          props.onAddSuccess?.();
                        },
                      );

                      if (res?.status === 409) {
                        setErrorMsg(
                          "Error: This item already exists in your store.",
                        );
                      } else if (res?.error) {
                        setErrorMsg("Error: Failed to add item to the store.");
                      }
                    }
                  }}
                >
                  Add
                  <input
                    className="input input-bordered"
                    type="number"
                    min={0}
                    id="storeAdd"
                    form="storeAddForm"
                    value={newQuantity}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.nativeEvent.stopImmediatePropagation();
                    }}
                    onChange={(e) => {
                      setNewQuantity(e.target.value);
                    }}
                  ></input>
                </button>
              </form>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
