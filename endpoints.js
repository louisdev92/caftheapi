const express = require("express");
const db = require("./db");
const router = express.Router();

/*
 * Route : Lister les produits
 * Get /api/produits
 */
router.get("/produits", (req, res) => {
    db.query("SELECT * FROM produits", (err, result) => {
        if (err) {
            return res.status(500).json({message: "Erreur du serveur"});
        }
        res.json(result);
    });
});

/*
 * Route : Récupérer un produit par son ID
 * Get /api/produits/:id
 * Exemple : GET /api/produits/3
 */

router.get("/produits/:id", (req, res) => {
    const {id} = req.params; // const id = req.params.id;

    db.query("SELECT * FROM produits WHERE id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur du serveur" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        res.json(result[0]); // Retournera que Le premier résultat
    });
});

module.exports = router;
