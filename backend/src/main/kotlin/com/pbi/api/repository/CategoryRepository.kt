package com.pbi.api.repository

import com.pbi.api.config.awaitList
import com.pbi.api.domain.Category
import com.pbi.generated.tables.records.CategoriesRecord
import com.pbi.generated.tables.references.CATEGORIES
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.jooq.DSLContext
import org.jooq.kotlin.coroutines.transactionCoroutine
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

interface CategoryRepository {
    suspend fun save(category: Category): Category
    suspend fun findById(id: UUID): Category?
    suspend fun findAllActive(): List<Category>
    suspend fun findByParentId(parentId: UUID): List<Category>
    suspend fun findByParentIds(parentIds: List<UUID>): List<Category>
    suspend fun searchByName(query: String): List<Category>
    suspend fun findByIds(ids: List<UUID>): List<Category>
    suspend fun delete(id: UUID)
    suspend fun update(category: Category): Category
    suspend fun allExistsByIds(categories: Set<UUID>): Boolean
}

@Repository
class JooqCategoryRepository(
    private val dsl: DSLContext
) : CategoryRepository {

    override suspend fun save(category: Category): Category {
        return dsl.transactionCoroutine { configuration ->
            val ctx = configuration.dsl()
            if (category.id == UUID(0, 0)) {
                // New category - let database generate UUID using PostgreSQL uuidv7() function
                val record = ctx.insertInto(CATEGORIES)
                    .set(CATEGORIES.NAME, category.name)
                    .set(CATEGORIES.DESCRIPTION, category.description)
                    .set(CATEGORIES.PARENT_ID, category.parentId)
                    .set(CATEGORIES.ACTIVATED_AT, category.activatedAt ?: LocalDateTime.now())
                    .set(CATEGORIES.CREATED_AT, category.createdAt)
                    .set(CATEGORIES.UPDATED_AT, category.updatedAt)
                    .returningResult()
                    .awaitFirst()

                category.copy(id = record.get(CATEGORIES.ID)!!)
            } else {
                // Update existing category
                ctx.update(CATEGORIES)
                    .set(CATEGORIES.NAME, category.name)
                    .set(CATEGORIES.DESCRIPTION, category.description)
                    .set(CATEGORIES.PARENT_ID, category.parentId)
                    .set(CATEGORIES.ACTIVATED_AT, category.activatedAt)
                    .set(CATEGORIES.UPDATED_AT, LocalDateTime.now())
                    .where(CATEGORIES.ID.eq(category.id))
                    .awaitFirst()

                category.copy(updatedAt = LocalDateTime.now())
            }
        }
    }

    override suspend fun findById(id: UUID): Category? {
        return dsl.selectFrom(CATEGORIES)
            .where(CATEGORIES.ID.eq(id))
            .and(CATEGORIES.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToCategory(it) }
    }

    override suspend fun findAllActive(): List<Category> {
        return dsl.selectFrom(CATEGORIES)
            .where(CATEGORIES.DELETED_AT.isNull)
            .orderBy(CATEGORIES.NAME)
            .awaitList()
            .map { mapRecordToCategory(it) }
    }

    override suspend fun findByParentId(parentId: UUID): List<Category> {
        return dsl.selectFrom(CATEGORIES)
            .where(CATEGORIES.PARENT_ID.eq(parentId))
            .and(CATEGORIES.DELETED_AT.isNull)
            .orderBy(CATEGORIES.NAME)
            .awaitList()
            .map { mapRecordToCategory(it) }
    }

    override suspend fun findByParentIds(parentIds: List<UUID>): List<Category> {
        return dsl.selectFrom(CATEGORIES)
            .where(CATEGORIES.PARENT_ID.`in`(parentIds))
            .and(CATEGORIES.DELETED_AT.isNull)
            .orderBy(CATEGORIES.NAME)
            .awaitList()
            .map { mapRecordToCategory(it) }
    }

    override suspend fun searchByName(query: String): List<Category> {
        val searchPattern = "%$query%"
        return dsl.selectFrom(CATEGORIES)
            .where(CATEGORIES.NAME.likeIgnoreCase(searchPattern))
            .and(CATEGORIES.DELETED_AT.isNull)
            .orderBy(CATEGORIES.NAME)
            .awaitList()
            .map { mapRecordToCategory(it) }
    }

    override suspend fun findByIds(ids: List<UUID>): List<Category> {
        if (ids.isEmpty()) return emptyList()
        return dsl.selectFrom(CATEGORIES)
            .where(CATEGORIES.ID.`in`(ids))
            .and(CATEGORIES.DELETED_AT.isNull)
            .orderBy(CATEGORIES.NAME)
            .awaitList()
            .map { mapRecordToCategory(it) }
    }

    override suspend fun delete(id: UUID) {
        dsl.update(CATEGORIES)
            .set(CATEGORIES.DELETED_AT, LocalDateTime.now())
            .set(CATEGORIES.UPDATED_AT, LocalDateTime.now())
            .where(CATEGORIES.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun update(category: Category): Category {
        return save(category)
    }

    override suspend fun allExistsByIds(categories: Set<UUID>): Boolean {
        if (categories.isEmpty()) return true

        val count = dsl.selectCount()
            .from(CATEGORIES)
            .where(CATEGORIES.ID.`in`(categories))
            .and(CATEGORIES.DELETED_AT.isNull)
            .awaitFirst()
            .value1()

        return count == categories.size
    }

    private fun mapRecordToCategory(record: CategoriesRecord): Category {
        return Category(
            id = record.get(CATEGORIES.ID)!!,
            name = record.get(CATEGORIES.NAME)!!,
            description = record.get(CATEGORIES.DESCRIPTION),
            parentId = record.get(CATEGORIES.PARENT_ID),
            activatedAt = record.get(CATEGORIES.ACTIVATED_AT),
            deletedAt = record.get(CATEGORIES.DELETED_AT),
            createdAt = record.get(CATEGORIES.CREATED_AT)!!,
            updatedAt = record.get(CATEGORIES.UPDATED_AT)!!
        )
    }
}