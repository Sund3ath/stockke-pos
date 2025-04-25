"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryResolvers = void 0;
const CategoryService_1 = require("../../service/CategoryService");
const categoryService = new CategoryService_1.CategoryService();
exports.categoryResolvers = {
    Query: {
        categories: async () => {
            return categoryService.getAllCategories();
        },
        category: async (_, { id }) => {
            return categoryService.getCategoryById(id);
        },
    },
    Mutation: {
        createCategory: async (_, { input }) => {
            return categoryService.createCategory(input);
        },
        updateCategory: async (_, { id, input }) => {
            return categoryService.updateCategory(id, input);
        },
        deleteCategory: async (_, { id }) => {
            return categoryService.deleteCategory(id);
        },
        toggleCategoryStatus: async (_, { id }) => {
            return categoryService.toggleCategoryStatus(id);
        },
    },
};
//# sourceMappingURL=category.js.map