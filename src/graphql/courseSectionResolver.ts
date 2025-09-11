import { successResponse, errorResponse } from "../utils/reponsehandler";
import courseSection from "../models/courseSections";
import { requireAuth, withAuth } from "../middleware/auth";
const mapSection = (section: any) => ({
  ...section,
  id: section._id.toString(),
  content: {
    ...section.content,
    exercises: section.content.exercises?.map((e: any) => ({
      ...e,
      id: e._id.toString(),
    })),
    quizzes: section.content.quizzes?.map((q: any) => ({
      ...q,
      id: q._id.toString(),
    })),
  },
});

export const courseSectionResolver = {
  Query: {
    sectionsByCourse: async (_: any, { courseId }: { courseId: string }) => {
      try {
        const sections = await courseSection.find({ courseId }).lean();
        if (!sections.length) return errorResponse("No sections found");
        return successResponse(
          sections.map((s) => mapSection(s)),
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
        return successResponse(
          mapSection(section), // ✅ ensure quizzes/exercises get IDs
          "Section fetched successfully"
        );
      } catch (err) {
        return errorResponse("Failed to fetch section", err);
      }
    },
  },

  Mutation: {
    createSection: withAuth(async (
      _: any,
      { courseId, title, markdown, exercises, quizzes }: any,
      context: any
    ) => {
      try {
        console.log('Creating section with:', { courseId, title, markdown, exercises, quizzes });
        
        const section = await courseSection.create({
          courseId,
          title,
          content: { 
            markdown, 
            exercises: exercises || [], 
            quizzes: quizzes || [] 
          },
        });
        
        console.log('Section created successfully:', section);
        
        return successResponse(
          mapSection(section.toObject()),
          "Section created successfully"
        );
      } catch (err) {
        console.error('Error creating section:', err);
        if (err instanceof Error) {
          console.error('Error details:', err.message);
          console.error('Error stack:', err.stack);
        }
        return errorResponse("Failed to create section", err);
      }
    }),

    // updateSection: async (
    //   _: any,
    //   { id, title, markdown, exercises, quizzes }: any
    // ) => {
    //   try {
    //     const updates: any = {};
    //     if (title) updates.title = title;
    //     if (markdown || exercises || quizzes) {
    //       updates.content = {};
    //       if (markdown) updates.content.markdown = markdown;
    //       if (exercises) updates.content.exercises = exercises;
    //       if (quizzes) updates.content.quizzes = quizzes;
    //     }

    //     const section = await courseSection.findByIdAndUpdate(id, updates, {
    //       new: true,
    //     });
    //     if (!section) return errorResponse("Section not found");

    //     return successResponse(section, "Section updated successfully");
    //   } catch (err) {
    //     return errorResponse("Failed to update section", err);
    //   }
    // },

    updateSection: withAuth(async (
      _: any,
      { id, title, markdown, exercises, quizzes }: any,
      context: any
    ) => {
      try {
        console.log("ecxexxexex", exercises, quizzes);
        const updates: any = {};

        if (title) updates.title = title;
        if (markdown) updates["content.markdown"] = markdown;

        // --- Exercises ---
        if (exercises && exercises.length > 0) {
          for (const ex of exercises) {
            if (ex.id) {
              // Update existing exercise by id
              await courseSection.updateOne(
                { _id: id, "content.exercises._id": ex.id },
                {
                  $set: {
                    "content.exercises.$.question": ex.question,
                    "content.exercises.$.hint": ex.hint,
                    "content.exercises.$.solution": ex.solution,
                  },
                }
              );
            } else {
              console.log("ellelelleleekekek");
              // Add new exercise
              await courseSection.updateOne(
                { _id: id },
                { $push: { "content.exercises": ex } }
              );
            }
          }
        }

        // --- Quizzes ---
        if (quizzes && quizzes.length > 0) {
          for (const q of quizzes) {
            if (q.id) {
              // Update existing quiz
              await courseSection.updateOne(
                { _id: id, "content.quizzes._id": q.id },
                {
                  $set: {
                    "content.quizzes.$.question": q.question,
                    "content.quizzes.$.options": q.options,
                    "content.quizzes.$.answer": q.answer,
                  },
                }
              );
            } else {
              // Add new quiz
              await courseSection.updateOne(
                { _id: id },
                { $push: { "content.quizzes": q } }
              );
            }
          }
        }

        // Apply simple updates (title, markdown)
        const section = await courseSection.findByIdAndUpdate(id, updates, {
          new: true,
        });

        if (!section) return errorResponse("Section not found");

        return successResponse(
          mapSection(section.toObject()),
          "Section updated successfully"
        );
      } catch (err) {
        return errorResponse("Failed to update section", err);
      }
    }),

    deleteSection: withAuth(async (_: any, { id }: any, context: any) => {
      try {
        const section = await courseSection.findByIdAndDelete(id);
        if (!section) return errorResponse("Section not found");
        return successResponse(section, "Section deleted successfully");
      } catch (err) {
        return errorResponse("Failed to delete section", err);
      }
    }),
  },
};
