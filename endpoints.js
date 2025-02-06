const express = require("express");
const db = require("./db");
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const {hash} = require("bcrypt");
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

    db.query("SELECT * FROM produits WHERE produit_id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur du serveur" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Produit non trouvé" });
        }
        res.json(result[0]); // Retournera que Le premier résultat
    });
});


/*
 * Route : Inscription d'un client
 * Get /api/clients/register
 * Exemple : JSON
 * {
 * "nom": "Dupont",
 * "prenom": "Jean",
 * "email": "jean.dupont@mail.com",
 * "mot_de_passe": "monMotDePasse"
 * }
 */


router.post("/clients/register", (req, res) => {
    const { nom, prenom, email, mot_de_passe } = req.body;

    // Vérifier si l'email est déjà présent dans la base de données
    db.query("SELECT * FROM clients WHERE email = ?", [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur du serveur" });
        }
        if (result.length > 0) {
            return res.status(400).json({ message: "Cette adresse e-mail est déjà utilisée" });
        }

        // Hash du mot de passe
        bcrypt.hash(mot_de_passe, 10, (err, hash) => {
            if (err) {
                return res.status(500).json({ message: "Erreur lors du hashage du mot de passe" });
            }

            // Insertion du nouveau client
            db.query("INSERT INTO clients (nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?)",
                [nom, prenom, email, hash],
                (err, result) => {
                    if (err) {
                        return res
                            .status(500)
                            .json({ message: "Erreur lors de l'inscription" });
                    }
                    return res.status(201).json({ message: "Client enregistré avec succès", client_id: result.insertId });
                }
            );
        });
    });
});

// Fiche client

    router.get("/ficheclient/:id", (req, res) => {
        const {id} = req.params; // const id = req.params.id;

    db.query("SELECT * FROM clients WHERE client_id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur du serveur" });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Client non trouvé" });
        }
        res.json(result[0]); // Retournera que Le premier résultat
    });
});


module.exports = router;
