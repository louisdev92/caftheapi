const express = require("express");
const db = require("./db");
const {verifyToken} = require("./middleware");
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const {hash} = require("bcrypt");
const router = express.Router();
const jwt = require ("jsonwebtoken")
const {sign} = require ("jsonwebtoken");
require("dotenv").config();

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

// Lister commande d'un client

router.get("/clients/:id/commandes", (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM commandes WHERE client_id = ?", [id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur du serveur" });
        }
        res.json(result);
    });
});

// Détails d'une commande d'un client

router.get("/clients/:id/commandes/:commande_id", (req, res) => {
    const { id, commande_id } = req.params;

    // Récupérer la commande avec les détails de base

    db.query(
        "SELECT * FROM commandes WHERE client_id = ? AND commande_id = ?",
        [id, commande_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Erreur du serveur" });
            }
            if (result.length === 0) {
                return res.status(404).json({ message: "Commande non trouvée" });
            }

            const commande = result[0];

            // Récupérer les lignes de commande associées à cette commande
            db.query(
                "SELECT lc.*, p.nom AS produit_nom, p.description AS produit_description, p.prix_HT, p.prix_TTC FROM lignes_commande lc " +
                "JOIN produits p ON lc.produit_id = p.produit_id " +
                "WHERE lc.commande_id = ?",
                [commande_id],
                (err, lignes_result) => {
                    if (err) {
                        return res.status(500).json({ message: "Erreur du serveur" });
                    }

                    // Ajouter les lignes de commande aux détails de la commande
                    commande.lignes_commande = lignes_result;

                    res.json(commande);
                }
            );
        }
    );
});

// Connexion
/*router.post("/clients/login", (req, res) => {
    const { email, mot_de_passe } = req.body;
    db.query("SELECT * FROM clients WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur du serveur" });
        if (result.length === 0) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

        const client = result[0];
        const match = await bcrypt.compare(mot_de_passe, client.mot_de_passe);
        if (!match) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

        const token = jwt.sign({ clientId: client.client_id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({ message: "Connexion réussie", token });
    });
}); */

// Modifier fiche client
router.put("/clients/:id", (req, res) => {
    const { id } = req.params;
    const { nom, prenom, adresse_livraison } = req.body;
    db.query("UPDATE clients SET nom = ?, prenom = ?, adresse_livraison = ? WHERE client_id = ?",
        [nom, prenom, adresse_livraison, id], (err, result) => {
            if (err) return res.status(500).json({ message: "Erreur du serveur" });
            res.json({ message: "Informations mises à jour" });
        });
});

// Modifier mot de passe
router.put("/clients/:id/password", async (req, res) => {
    const { id } = req.params;
    const { mot_de_passe } = req.body;
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    db.query("UPDATE clients SET mot_de_passe = ? WHERE client_id = ?", [hashedPassword, id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur du serveur" });
        res.json({ message: "Mot de passe mis à jour" });
    });
});

// Supprimer un client
router.delete("/clients/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM clients WHERE client_id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Erreur du serveur" });
        res.json({ message: "Compte supprimé avec succès" });
    });
});

// Passer une commande
router.post("/clients/:id/commandes", (req, res) => {
    const { id } = req.params;
    const { produits } = req.body; // Ex: [{ produit_id: 1, quantite: 2 }]
    db.query("INSERT INTO commandes (client_id, mode_vente, statut) VALUES (?, 'en ligne', 'en préparation')",
        [id], (err, result) => {
            if (err) return res.status(500).json({ message: "Erreur du serveur" });
            const commande_id = result.insertId;

            const values = produits.map(p => [commande_id, p.produit_id, null, p.quantite, null, 0, 0]);
            db.query("INSERT INTO lignes_commande (commande_id, produit_id, tranche_poids_id, quantite, poids, prix_unitaire_HT, prix_unitaire_TTC) VALUES ?",
                [values], (err, result) => {
                    if (err) return res.status(500).json({ message: "Erreur lors de l'ajout des produits" });
                    res.json({ message: "Commande passée avec succès", commande_id });
                });
        });
});

/* npm install jsonwebtoken */

router.post("/clients/login", (req, res) => {
    const { email, mot_de_passe } = req.body;

    db.query("SELECT * FROM clients WHERE email = ?", [email], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur du serveur" });
        }

        if (result.length === 0) {
            return res.status(401).json({ message: "Identifiant incorrect" });
        }

        const client = result[0];

        /* Vérification du mot de passe */
        bcrypt.compare(mot_de_passe, client.mot_de_passe, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: "Erreur du serveur" });
            }
            if (!isMatch) {
                return res.status(401).json({ message: "Identifiant incorrect" });
            }

        // Génération d'un token JWT
            const token =sign(
                {id: client.client_id, email: client.email},
                process.env.JWT_SECRET,
                {expiresIn: process.env.JWT_EXPIRES_IN},
            );

            res.json({
                message: "Connexion réussie",
                token,
                    client:{id:client.client_id,
                    nom:client.nom,
                    prenom:client.prenom,
                    email: client.email,
                },
            })
        });
    });
});



module.exports = router;