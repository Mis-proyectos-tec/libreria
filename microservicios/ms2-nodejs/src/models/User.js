const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username:    { type: String, required: true },
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    password:    { type: String, default: "" },
    initials:    { type: String, default: "" },
    firebaseUid: { type: String, required: true, unique: true },
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

module.exports = mongoose.model("User", userSchema);
