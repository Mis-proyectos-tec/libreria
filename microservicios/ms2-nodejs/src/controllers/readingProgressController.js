const ReadingProgress = require("../models/ReadingProgress");

async function getAll(req, res) {
  try {
    const progress = await ReadingProgress.find();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getById(req, res) {
  try {
    const progress = await ReadingProgress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: "Progreso no encontrado" });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function create(req, res) {
  try {
    const progress = new ReadingProgress({
      ...req.body,
      updatedAt: new Date(),
    });
    const saved = await progress.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    const updated = await ReadingProgress.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Progreso no encontrado" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function remove(req, res) {
  try {
    const deleted = await ReadingProgress.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Progreso no encontrado" });
    res.json({ message: "Progreso eliminado correctamente", id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { getAll, getById, create, update, remove };
