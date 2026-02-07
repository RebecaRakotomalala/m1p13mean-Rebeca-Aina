/home/rebeca/Bureau/ITU-Master/WEV Avance/master-exam/m1p13mean-Rebeca-Aina/Frontend/Boutique/src/app/theme/layouts/admin-layout/navigation/navigation.ts (contenue nav bar)

db.boutiques.insertOne({
  utilisateur_id: ObjectId("69838220b0789e50b2703ce5"), // ID de ton utilisateur
  nom: "Fanelie Boutique",
  categorie_principale: "Mode",
  categories_secondaires: ["Vêtements", "Accessoires"],
  email_contact: "contact@ainaboutique.com",
  telephone_contact: "0340000000",
  services: ["livraison"],
  galerie_photos: ["https://res.cloudinary.com/ddsocampb/image/upload/v1770485789/Aina3_mcpveo.jpg", "https://res.cloudinary.com/ddsocampb/image/upload/v1770485789/Aina2_etrnpc.jpg, "https://res.cloudinary.com/ddsocampb/image/upload/v1770485789/Aina1_lza4az.jpg, "https://res.cloudinary.com/ddsocampb/image/upload/v1770485789/Aina4_ivfxsj.jpg"],
  statut: "active",
  plan: "premium",
  date_creation: new Date(),
  date_modification: new Date()
})