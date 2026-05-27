const mongoose = require("mongoose");

const readingProgressSchema = new mongoose.Schema(
  {
    userId:      { type: String, required: true },
    bookId:      { type: String, required: true },
    currentPage: { type: Number, default: 1 },
    percentage:  { type: Number, default: 0 },
    updatedAt:   { type: Date, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("ReadingProgress", readingProgressSchema);
