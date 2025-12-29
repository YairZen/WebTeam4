import mongoose from "mongoose";

const ReflectionSchema = new mongoose.Schema({
  teamId: {
    type: String,
    required: true
  },
  memberId: {
    type: String,
    required: true
  },
  answers: {
    type: [Number],
    required: true,
    validate: v => v.length === 5
  },
  freeText: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.models.Reflection ||
  mongoose.model("Reflection", ReflectionSchema);
