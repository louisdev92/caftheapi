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

module.exports = router;
