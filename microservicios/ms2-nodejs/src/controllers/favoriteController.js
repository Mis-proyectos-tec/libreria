const Favorite = require("../models/Favorite");

async function getAll(req, res) {
  try {
    const favorites = await Favorite.find();
    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getById(req, res) {
  try {
    const favorite = await Favorite.findById(req.params.id);
    if (!favorite) return res.status(404).json({ message: "Favorito no encontrado" });
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function create(req, res) {
  try {
    const favorite = new Favorite(req.body);
    const saved = await favorite.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function remove(req, res) {
  try {
    const deleted = await Favorite.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Favorito no encontrado" });
    res.json({ message: "Favorito eliminado correctamente", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAll, getById, create, remove };
