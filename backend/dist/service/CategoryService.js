"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const data_source_1 = require("../config/data-source");
const Category_1 = require("../entity/Category");
class CategoryService {
    constructor() {
        this.categoryRepository = data_source_1.AppDataSource.getRepository(Category_1.Category);
    }
    async getAllCategories() {
        return this.categoryRepository.find({
            order: {
                name: 'ASC'
            }
        });
    }
    async getCategoryById(id) {
        return this.categoryRepository.findOneBy({ id });
    }
    async createCategory(categoryData) {
        const category = this.categoryRepository.create(categoryData);
        return this.categoryRepository.save(category);
    }
    async updateCategory(id, categoryData) {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            return null;
        }
        Object.assign(category, categoryData);
        return this.categoryRepository.save(category);
    }
    async deleteCategory(id) {
        const result = await this.categoryRepository.delete(id);
        return result.affected !== 0;
    }
    async toggleCategoryStatus(id) {
        const category = await this.categoryRepository.findOneBy({ id });
        if (!category) {
            return null;
        }
        category.isActive = !category.isActive;
        return this.categoryRepository.save(category);
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=CategoryService.js.map