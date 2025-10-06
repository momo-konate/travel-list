import "./index.css";
import { useState, useEffect } from "react";

export default function App() {
  const [items, setItems] = useState([]);

  // 🔹 Charger les items depuis le backend au démarrage
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("http://localhost:5000/items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
      }
    }
    fetchItems();
  }, []);

  // ➕ Ajouter un item
  async function handleAddItem(newItem) {
    try {
      const res = await fetch("http://localhost:5000/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      const data = await res.json();
      setItems((items) => [...items, data]);
    } catch (err) {
      console.error("Erreur ajout :", err);
    }
  }

  // ❌ Supprimer un item
  async function handleDeleteItem(id) {
    try {
      await fetch(`http://localhost:5000/items/${id}`, { method: "DELETE" });
      setItems((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
    }
  }

  // ✅ Cocher / décocher un item
  async function handleToggleItem(id) {
    try {
      const res = await fetch(`http://localhost:5000/items/${id}/toggle`, {
        method: "PATCH",
      });
      const updated = await res.json();
      setItems((items) =>
        items.map((item) => (item.id === id ? updated : item))
      );
    } catch (err) {
      console.error("Erreur toggle :", err);
    }
  }

  // 🔸 Rendu principal
  return (
    <div className="app">
      <Logo />
      <Form onAddItem={handleAddItem} />
      <PackagingList
        items={items}
        onDeleteItem={handleDeleteItem}
        onToggleItem={handleToggleItem}
      />
      <Stats items={items} />
    </div>
  );
}

function Logo() {
  return <h1>🌵 far away 👜</h1>;
}

function Form({ onAddItem }) {
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(1);

  function handleSubmit(e) {
    e.preventDefault();
    if (!description) return;

    const newItem = {
      description,
      quantity,
      packed: false,
    };

    onAddItem(newItem);
    setDescription("");
    setQuantity(1);
  }

  return (
    <div className="add-form">
      <h3>De quoi avez-vous besoin pour votre voyage 🤗 ?</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="article..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Quantité"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <button>➕ Ajouter</button>
      </form>
    </div>
  );
}

function PackagingList({ items, onDeleteItem, onToggleItem }) {
  return (
    <div className="list">
      <ul>
        {items.map((item) => (
          <Item
            key={item.id}
            item={item}
            onDeleteItem={onDeleteItem}
            onToggleItem={onToggleItem}
          />
        ))}
      </ul>
    </div>
  );
}

function Item({ item, onDeleteItem, onToggleItem }) {
  return (
    <li className="item">
      <input
        type="checkbox"
        checked={item.packed}
        onChange={() => onToggleItem(item.id)}
      />
      <span style={item.packed ? { textDecoration: "line-through" } : {}}>
        {item.quantity} {item.description}
      </span>
      <button onClick={() => onDeleteItem(item.id)}>❌</button>
    </li>
  );
}

function Stats({ items }) {
  if (items.length === 0)
    return (
      <footer className="stats">
        <em>Commence à ajouter des articles à ta liste ✈️</em>
      </footer>
    );

  const numItems = items.length;
  const numPacked = items.filter((item) => item.packed).length;
  const percentage = Math.round((numPacked / numItems) * 100);

  return (
    <footer className="stats">
      <em>
        💼 Tu as {numItems} articles dans ta liste, dont {numPacked} déjà dans
        ta valise ({percentage}%)
      </em>
    </footer>
  );
}
