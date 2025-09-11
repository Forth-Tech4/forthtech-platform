import Course from "../models/courses";
import { successResponse, errorResponse } from "../utils/reponsehandler";
import { requireAuth, withAuth } from "../middleware/auth";

export const courseResolver = {
  Query: {
    courses: async () => {
      try {
        const courses = await Course.find().lean();
        if (!courses.length) return errorResponse("No courses found");
        return successResponse(
          courses.map((c) => ({ ...c, id: c._id.toString() })),
          "Courses fetched successfully"
        );
      } catch (err) {
        return errorResponse("Failed to fetch courses", err);
      }
    },

    course: async (_: any, { id }: { id: string }) => {
      try {
        const course = await Course.findById(id).lean();
        if (!course) return errorResponse("Course not found");
        return successResponse(
          { ...course, id: course._id.toString() },
          "Course fetched successfully"
        );
      } catch (err) {
        return errorResponse("Failed to fetch course", err);
      }
    },

    coursesByIndex: async (_: any, { indexId }: { indexId: string }) => {
      try {
        const courses = await Course.find({ indexId }).lean();
        if (!courses.length) return errorResponse("No courses found for index");
        return successResponse(
          courses.map((c) => ({ ...c, id: c._id.toString() })),
          "Courses fetched successfully"
        );
      } catch (err) {
        return errorResponse("Failed to fetch courses", err);
      }
    },
  },

  Mutation: {
    createCourse: withAuth(async (_: any, { title, description, indexId }: any, context: any) => {
      try {
        const existingCourse = await Course.findOne({ title, indexId });
        if (existingCourse) {
          return errorResponse(
            "Course with this title already exists in the same index"
          );
        }

        const course = await Course.create({ title, description, indexId });
        return successResponse(course, "Course created successfully");
      } catch (err) {
        return errorResponse("Failed to create course", err);
      }
    }),

    updateCourse: withAuth(async (_: any, { id, title, description, indexId }: any, context: any) => {
      try {
        console.log("dulepicatetttt..",id,title,description,indexId)
        const duplicate = await Course.findOne({
          title: title, // use new or old title
          indexId: indexId, // use new or old indexId
          _id: { $ne: id }, // exclude the current course
        });

        if (duplicate) {
          return errorResponse(
            "Another course with this title already exists in the same index"
          );
        }

        // Proceed with update
        const course = await Course.findByIdAndUpdate(
          id,
          { title, description, indexId },
          { new: true }
        );
        if (!course) return errorResponse("Course not found");
        return successResponse(course, "Course updated successfully");
      } catch (err) {
        return errorResponse("Failed to update course", err);
      }
    }),

    deleteCourse: withAuth(async (_: any, { id }: any, context: any) => {
      try {
        const course = await Course.findByIdAndDelete(id);
        if (!course) return errorResponse("Course not found");
        return successResponse(course, "Course deleted successfully");
      } catch (err) {
        return errorResponse("Failed to delete course", err);
      }
    }),
  },
};
