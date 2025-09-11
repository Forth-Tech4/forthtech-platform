import { successResponse, errorResponse } from "../utils/reponsehandler";
import courseSection from "../models/courseSections";
import UserCourseProgress from "../models/userCourseProgress"

export const userCourseProgressResolver = {
  Query: {
    getUserProgress: async (_: any, { userId, courseId }: any) => {
      try {
        const progress = await UserCourseProgress.findOne({ userId, courseId }).lean();
        return successResponse(progress?.completedSections || [], "Progress fetched successfully");
      } catch (err) {
        return errorResponse("Failed to fetch progress", err);
      }
    },
  },

  Mutation: {
    markSectionComplete: async (_: any, { userId, courseId, sectionId }: any) => {
      try {
        // 1. Check if the course exists and contains the section
        const course = await courseSection.findOne({
          _id: sectionId,
          courseId:courseId, // Query to find the course AND the section in one go
        });
        
        if (!course) {
          return errorResponse("Course or section not found");
        }

        const progress = await UserCourseProgress.findOne({ userId, courseId });

        // If not exists, create
        if (!progress) {
          const newProgress = await UserCourseProgress.create({
            userId,
            courseId,
            completedSections: [sectionId],
          });
          return successResponse(newProgress, "Section marked as complete");
        } else {
          // If section not already marked complete
          if (!progress.completedSections.includes(sectionId)) {
            progress.completedSections.push(sectionId);
            await progress.save();
          }
          return successResponse(progress, "Section marked as complete");
        }
      } catch (err) {
        return errorResponse("Failed to mark section as complete", err);
      }
    },
    
    unmarkSectionComplete: async (_: any, { userId, courseId, sectionId }: any) => {
      try {
        // 1. Check if the course and section exist
        const sectionExists = await courseSection.findOne({
          _id: sectionId,
          courseId: courseId,
        });

        if (!sectionExists) {
          return errorResponse("Course or section not found");
        }
        
        // 2. Find and update the user's progress
        const updatedProgress = await UserCourseProgress.findOneAndUpdate(
          { userId, courseId },
          { $pull: { completedSections: sectionId } },
          { new: true, lean: true }
        );

        if (!updatedProgress) {
          return errorResponse("User progress not found");
        }

        return successResponse(updatedProgress, "Section unmarked successfully");
      } catch (err) {
        return errorResponse("Failed to unmark section", err);
      }
    },

  },
};