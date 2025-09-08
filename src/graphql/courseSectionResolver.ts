// import { successResponse, errorResponse } from "../../utils/reponsehandler";
import { successResponse,errorResponse } from "../utils/reponsehandler";
import courseSection from "../models/courseSections";

export const courseSectionResolver = {
  Query: {
    sectionsByCourse: async (_: any, { courseId }: { courseId: string }) => {
      try {
        const sections = await courseSection.find({ courseId }).lean();
        if (!sections.length) return errorResponse("No sections found");
        return successResponse(
          sections.map(s => ({ ...s, id: s._id.toString() })),
          "Sections fetched successfully"
        );
      } catch (err) {
        return errorResponse("Failed to fetch sections", err);
      }
    },

    section: async (_: any, { id }: { id: string }) => {
      try {
        const section = await courseSection.findById(id).lean();
        if (!section) return errorResponse("Section not found");
        return successResponse({ ...section, id: section._id.toString() }, "Section fetched successfully");
      } catch (err) {
        return errorResponse("Failed to fetch section", err);
      }
    },
  },

  Mutation: {
    createSection: async (_: any, { courseId, title, markdown, exercises, quizzes }: any) => {
      try {
        const section = await courseSection.create({
          courseId,
          title,
          content: { markdown, exercises, quizzes },
        });
        return successResponse(section, "Section created successfully");
      } catch (err) {
        return errorResponse("Failed to create section", err);
      }
    },

    updateSection: async (_: any, { id, title, markdown, exercises, quizzes }: any) => {
      try {
        const updates: any = {};
        if (title) updates.title = title;
        if (markdown || exercises || quizzes) {
          updates.content = {};
          if (markdown) updates.content.markdown = markdown;
          if (exercises) updates.content.exercises = exercises;
          if (quizzes) updates.content.quizzes = quizzes;
        }

        const section = await courseSection.findByIdAndUpdate(id, updates, { new: true });
        if (!section) return errorResponse("Section not found");

        return successResponse(section, "Section updated successfully");
      } catch (err) {
        return errorResponse("Failed to update section", err);
      }
    },

    deleteSection: async (_: any, { id }: any) => {
      try {
        const section = await courseSection.findByIdAndDelete(id);
        if (!section) return errorResponse("Section not found");
        return successResponse(section, "Section deleted successfully");
      } catch (err) {
        return errorResponse("Failed to delete section", err);
      }
    },
  },
};
