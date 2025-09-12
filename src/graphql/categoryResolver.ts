import { successResponse, errorResponse } from "../utils/reponsehandler";
import Category from "../models/category";
import Index from "../models/indexes";
import { requireAuth, withAuth } from "../middleware/auth";
export const categoryResolver = {
  Query: {
    categories: async () => {
      try {
        const categories = await Category.find().lean();
        if (!categories || categories.length === 0) {
          return errorResponse("No categories found");
        }

        const mappedCategories = await Promise.all(
          categories.map(async (c) => {
            const indexes = await Index.find({ categoryId: c._id }).lean();
            return {
              ...c,
              id: c._id.toString(),
              indexes: indexes.map((i) => ({
                ...i,
                id: i._id.toString(),
              })),
            };
          })
        );

        return successResponse(
          mappedCategories,
          "Categories fetched successfully"
        );
      } catch (err) {
        return errorResponse("Internal server error", err);
      }
    },

    category: async (_: any, { id }: { id: string }) => {
      try {
        const category = await Category.findById(id).lean();
        if (!category) {
          return errorResponse("Category not found");
        }

        const indexes = await Index.find({ categoryId: id }).lean();

        const mappedCategory = {
          ...category,
          id: category._id.toString(),
          indexes: indexes.map((i) => ({
            ...i,
            id: i._id.toString(),
          })),
        };

        return successResponse(mappedCategory, "Category fetched successfully");
      } catch (err) {
        return errorResponse("Internal server error", err);
      }
    },
  },

  Mutation: {
    createCategory: withAuth(async (_: any, { name, description }: any, context: any) => {
      try {
        const exists = await Category.findOne({ name });
        if (exists) {
          return errorResponse("Category already exists");
        }
          const category = await Category.create({
            name,
            description,
            created_by: context.user.userId,
          });
        return successResponse(category, "Category created successfully");
      } catch (err) {
        return errorResponse("Failed to create category", err);
      }
    }),

    updateCategory: withAuth(async (_: any, { id, name, description }: any, context: any) => {
      try {
        if (name) {
          const exists = await Category.findOne({ name, _id: { $ne: id } });
          if (exists) {
            return errorResponse("Category with this name already exists");
          }
        }

        const category = await Category.findByIdAndUpdate(
          id,
          { name, description },
          { new: true }
        );
        if (!category) {
          return errorResponse("Category not found");
        }
        return successResponse(category, "Category updated successfully");
      } catch (err) {
        return errorResponse("Failed to update category", err);
      }
    }),

    deleteCategory: withAuth(async (_: any, { id }: any, context: any) => {
      try {
        const category = await Category.findByIdAndDelete(id);
        if (!category) {
          return errorResponse("Category not found");
        }
        return successResponse(category, "Category deleted successfully");
      } catch (err) {
        return errorResponse("Failed to delete category", err);
      }
    }),
  },
};
