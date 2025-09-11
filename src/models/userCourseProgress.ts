// models/userProgress.ts
import mongoose, { Schema } from "mongoose";

const userProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  completedSections: [{ type: Schema.Types.ObjectId, ref: "courseSection" }],
}, { timestamps: true });

export default mongoose.model("UserProgress", userProgressSchema);
