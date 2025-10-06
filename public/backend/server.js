import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express();
app.use(cors());
app.use(express.json()); // pour lire le JSON du body

// 🔌 Connexion à PostgreSQL
const pool = new Pool({
  user: "postgres",      // ton nom d’utilisateur PostgreSQL
  host: "localhost",
  database: "voyages",    // ton nom de base
  password: "doudounenekine192021",// ton mot de passe PostgreSQL
  port: 5432,            // port par défaut
});

// ✅ Route pour récupérer tous les items
app.get("/items", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM items ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ➕ Route pour ajouter un item
app.post("/items", async (req, res) => {
  const { description, quantity } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO items (description, quantity, packed) VALUES ($1, $2, false) RETURNING *",
      [description, quantity]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur d’insertion" });
  }
});

// ❌ Supprimer un item
app.delete("/items/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM items WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur de suppression" });
  }
});

// 🔄 Changer l’état “packed”
app.patch("/items/:id/toggle", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE items SET packed = NOT packed WHERE id = $1 RETURNING *",
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur de mise à jour" });
  }
});

app.listen(5000, () => console.log("✅ Serveur démarré sur http://localhost:5000"));
