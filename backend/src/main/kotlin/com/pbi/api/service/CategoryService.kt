package com.pbi.api.service

import com.pbi.api.domain.Category
import com.pbi.api.exception.ResourceNotFoundException
import com.pbi.api.repository.CategoryRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class CategoryService(
    private val categoryRepository: CategoryRepository
) {

    suspend fun getAllActiveCategories(): List<Category> {
        return categoryRepository.findAllActive()
    }

    suspend fun getCategoryById(id: UUID): Category {
        return categoryRepository.findById(id)
            ?: throw ResourceNotFoundException("Category not found with id: $id")
    }

    suspend fun getSubcategories(parentId: UUID): List<Category> {
        return categoryRepository.findByParentId(parentId)
    }

    suspend fun getCategoryTree(): List<CategoryTreeNode> {
        val allCategories = getAllActiveCategories()
        
        // Build a map of parent categories
        val parentCategories = allCategories.filter { it.parentId == null }
        
        return parentCategories.map { parentCategory ->
            val subcategories = allCategories.filter { it.parentId == parentCategory.id }
            CategoryTreeNode(parentCategory, subcategories)
        }
    }

    suspend fun searchCategories(query: String): List<Category> {
        return categoryRepository.searchByName(query)
    }

    suspend fun getCategoriesByIds(ids: List<UUID>): List<Category> {
        return categoryRepository.findByIds(ids)
    }
}

data class CategoryTreeNode(
    val category: Category,
    val subcategories: List<Category>
) 