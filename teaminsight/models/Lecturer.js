import mongoose from "mongoose";

const LecturerSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Lecturer ||
  mongoose.model("Lecturer", LecturerSchema);
