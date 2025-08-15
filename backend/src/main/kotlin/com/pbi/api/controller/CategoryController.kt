package com.pbi.api.controller

import com.pbi.api.config.PublicEndpoint
import com.pbi.api.dto.*
import com.pbi.api.service.CategoryService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/v1/categories")
@PublicEndpoint
class CategoryController(
    private val categoryService: CategoryService
) {

    @GetMapping
    suspend fun getAllCategories(): ResponseEntity<ApiResponseDTO.Success<List<CategoryDTO.Output>>> {
        val categories = categoryService.getAllActiveCategories()
        
        val response = categories.map { category ->
            CategoryDTO.Output(
                id = category.id.toString(),
                name = category.name,
                description = category.description,
                parentId = category.parentId?.toString(),
                createdAt = category.createdAt,
                updatedAt = category.updatedAt
            )
        }
        
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Categories retrieved successfully"))
    }

    @GetMapping("/{id}")
    suspend fun getCategoryById(@PathVariable id: String): ResponseEntity<ApiResponseDTO.Success<CategoryDTO.Output>> {
        val categoryId = UUID.fromString(id)
        val category = categoryService.getCategoryById(categoryId)
        
        val response = CategoryDTO.Output(
            id = category.id.toString(),
            name = category.name,
            description = category.description,
            parentId = category.parentId?.toString(),
            createdAt = category.createdAt,
            updatedAt = category.updatedAt
        )
        
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Category retrieved successfully"))
    }

    @GetMapping("/{id}/subcategories")
    suspend fun getSubcategories(@PathVariable id: String): ResponseEntity<ApiResponseDTO.Success<List<CategoryDTO.Output>>> {
        val categoryId = UUID.fromString(id)
        val subcategories = categoryService.getSubcategories(categoryId)
        
        val response = subcategories.map { category ->
            CategoryDTO.Output(
                id = category.id.toString(),
                name = category.name,
                description = category.description,
                parentId = category.parentId?.toString(),
                createdAt = category.createdAt,
                updatedAt = category.updatedAt
            )
        }
        
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Subcategories retrieved successfully"))
    }

    @GetMapping("/tree")
    suspend fun getCategoryTree(): ResponseEntity<ApiResponseDTO.Success<List<CategoryTreeDTO.Output>>> {
        val categoryTree = categoryService.getCategoryTree()
        
        val response = categoryTree.map { treeNode ->
            CategoryTreeDTO.Output(
                id = treeNode.category.id.toString(),
                name = treeNode.category.name,
                description = treeNode.category.description,
                subcategories = treeNode.subcategories.map { subcategory ->
                    CategoryTreeDTO.Output.SubcategoryNode(
                        id = subcategory.id.toString(),
                        name = subcategory.name,
                        description = subcategory.description
                    )
                }
            )
        }
        
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Category tree retrieved successfully"))
    }
} 