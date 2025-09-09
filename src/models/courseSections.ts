import mongoose, { Schema, Document } from "mongoose";

interface IExercise {
  _id?: mongoose.Types.ObjectId;
  question: string;
  hint?: string;
  solution?: string;
}

interface IQuiz {
  _id?: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  answer: string;
}

export interface ISection extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  content: {
    markdown: string;
    exercises: IExercise[];
    quizzes: IQuiz[];
  };
}

const courseSectionSchema = new Schema<ISection>({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  title: { type: String, required: true },
  content: {
    markdown: { type: String, required: true },
    exercises: [
      {
        question: { type: String, required: true },
        hint: { type: String },
        solution: { type: String },
      },
        { _id: true } 
    ],
    quizzes: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        answer: { type: String, required: true },
      },
        { _id: true } 
    ],
  },
});

export default mongoose.model<ISection>("courseSection", courseSectionSchema);
