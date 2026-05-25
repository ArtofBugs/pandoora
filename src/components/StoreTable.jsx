import { useState } from "react";
import { supabase } from "../supabase/client";

async function addStore(name, price, quantity, user) {
  try {
    await supabase.from("store").insert({
      user_id: user,
      name: name,
      price: Number(price),
      available: Number(quantity),
      claimed: 0,
    });
  } catch (e) {
    console.error("Error adding document:", e);
  }
}

async function updateStore(id, field, content, type, user) {
  if (type === "number") {
    content = Number(content);
  }
  try {
    await supabase
      .from("store")
      .update({ [field]: content })
      .eq("id", id)
      .eq("user_id", user);
  } catch (e) {
    console.error("Error updating document:", e);
  }
}

async function deleteStore(id, user) {
  try {
    await supabase.from("store").delete().eq("id", id).eq("user_id", user);
  } catch (e) {
    console.error("Error deleting document:", e);
  }
}

async function claimStore(id, amount, user) {
  try {
    const { data: current } = await supabase
      .from("store")
      .select("claimed, available")
      .eq("id", id)
      .single();

    await supabase
      .from("store")
      .update({
        claimed: (current?.claimed || 0) + amount,
        available: (current?.available || 0) - amount,
      })
      .eq("id", id)
      .eq("user_id", user);
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
        content={props.data.name || `Untitled reward ${props.id}`}
        userId={props.userId}
      />
      <EditableCell
        id={props.id}
        min={0}
        step={1}
        field="price"
        type="number"
        content={props.data.price}
        userId={props.userId}
      />
      <EditableCell
        id={props.id}
        min={0}
        step={1}
        field="available"
        type="number"
        content={props.data.available}
        userId={props.userId}
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
                toClaim <= props.data.available &&
                claimStore(props.id, toClaim, props.userId);
            }}
          >
            Claim
            <input
              className="input input-bordered w-min"
              type="number"
              id={props.id}
              step={1}
              min={0}
              max={props.data.available}
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
          onClick={() => deleteStore(props.id, props.userId)}
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

  if (!props.user?.id) {
    return <p>Please sign in to use the Store.</p>;
  }

  return (
    <div className="w-screen p-2">
      <h1 className="font-bold text-xl w-full">Store</h1>
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
          {props.value &&
            props.value.docs.map((doc) => (
              <StoreRow
                key={doc.id}
                id={doc.id}
                data={doc.data()}
                userId={props.user.id}
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
                  onClick={() => {
                    newPrice >= 0 &&
                      newQuantity >= 0 &&
                      addStore(newName, newPrice, newQuantity, props.user.id);
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
