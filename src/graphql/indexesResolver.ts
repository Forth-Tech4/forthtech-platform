import { successResponse, errorResponse } from "../utils/reponsehandler";
import Index from "../models/indexes";
import Category from "../models/category";

export const indexResolver = {
  Query: {
    indexesByCategory: async (
      _: any,
      { categoryId }: { categoryId: string }
    ) => {
      try {
        const indexes = await Index.find({ categoryId }).lean();
        if (!indexes || indexes.length === 0) {
          return errorResponse("No indexes found for this category");
        }

        const mappedIndexes = indexes.map((i) => ({
          ...i,
          id: i._id.toString(),
        }));

        return successResponse(mappedIndexes, "Indexes fetched successfully");
      } catch (err) {
        return errorResponse("Internal server error", err);
      }
    },

    // ✅ New get-by-id API
    index: async (_: any, { id }: { id: string }) => {
      try {
        const index = await Index.findById(id).lean();
        if (!index) {
          return errorResponse("Index not found");
        }

        const mappedIndex = { ...index, id: index._id.toString() };
        return successResponse(mappedIndex, "Index fetched successfully");
      } catch (err) {
        return errorResponse("Internal server error", err);
      }
    },
  },

  Mutation: {
    createIndex: async (_: any, { name, description, categoryId }: any) => {
      try {
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
          return errorResponse("Invalid categoryId");
        }
        const existingIndex = await Index.findOne({ name, categoryId });
        if (existingIndex) {
          return errorResponse(
            "Index with this name already exists in the same category"
          );
        }

        const index: any = await Index.create({
          name,
          description,
          categoryId,
        });
        const mappedIndex = { ...index.toObject(), id: index._id.toString() };

        return successResponse(mappedIndex, "Index created successfully");
      } catch (err) {
        return errorResponse("Failed to create index", err);
      }
    },

    updateIndex: async (_: any, { id, name, description, categoryId }: any) => {
      try {
        if (name && categoryId) {
          const duplicate = await Index.findOne({
            name,
            categoryId,
            _id: { $ne: id }, // exclude the index being updated
          });
          if (duplicate) {
            return errorResponse(
              "Another index with this name already exists in the same category",
            );
          }
        }

        const index: any = await Index.findByIdAndUpdate(
          id,
          { name, description, categoryId },
          { new: true }
        );

        if (!index) {
          return errorResponse("Index not found");
        }

        const mappedIndex = { ...index.toObject(), id: index._id.toString() };

        return successResponse(mappedIndex, "Index updated successfully");
      } catch (err) {
        return errorResponse("Failed to update index", err);
      }
    },

    deleteIndex: async (_: any, { id }: any) => {
      try {
        const index: any = await Index.findByIdAndDelete(id);
        if (!index) {
          return errorResponse("Index not found");
        }
        const mappedIndex = { ...index.toObject(), id: index._id.toString() };
        return successResponse(mappedIndex, "Index deleted successfully");
      } catch (err) {
        return errorResponse("Failed to delete index", err);
      }
    },
  },

  Index: {
    category: async (parent: any) => {
      return await Category.findById(parent.categoryId).lean();
    },
  },
};
