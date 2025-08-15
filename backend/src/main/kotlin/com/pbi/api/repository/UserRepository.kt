package com.pbi.api.repository

import com.pbi.api.config.awaitList
import com.pbi.api.domain.*
import com.pbi.api.dto.PublicProfileDetailsDTO
import com.pbi.generated.tables.AdminProfiles.Companion.ADMIN_PROFILES
import com.pbi.generated.tables.BusinessProfiles.Companion.BUSINESS_PROFILES
import com.pbi.generated.tables.Categories.Companion.CATEGORIES
import com.pbi.generated.tables.IndividualProfiles.Companion.INDIVIDUAL_PROFILES
import com.pbi.generated.tables.UserIndustries.Companion.USER_INDUSTRIES
import com.pbi.generated.tables.UserInterests.Companion.USER_INTERESTS
import com.pbi.generated.tables.Users.Companion.USERS
import com.pbi.generated.tables.references.*
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.jooq.*
import org.jooq.impl.DSL
import org.springframework.stereotype.Repository
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*
import com.pbi.api.domain.User as DomainUser

interface UserRepository {
    suspend fun save(user: DomainUser): DomainUser
    suspend fun findById(id: UUID): DomainUser?
    suspend fun findByEmail(email: String): DomainUser?
    suspend fun findByIdOrEmailWithRolesAndPermissions(id: UUID? = null, email: String? = null): DomainUser?
    suspend fun findByLinkedinId(linkedinId: String): DomainUser?
    suspend fun findByVerificationToken(token: String): Record6<UUID?, String?, String?, LocalDateTime?, LocalDateTime?, String?>?
    suspend fun findByPasswordResetToken(token: String): DomainUser?
    suspend fun existsByEmail(email: String): Boolean
    suspend fun existsById(id: UUID): Boolean
    suspend fun delete(id: UUID)
    suspend fun findUserWithProfile(id: UUID): UserWithProfile?
    suspend fun updatePassword(id: UUID, passwordHash: String)
    suspend fun updateVerificationStatus(id: UUID, verifiedAt: LocalDateTime, activatedAt: LocalDateTime)
    suspend fun updateActivationStatus(id: UUID, activatedAt: LocalDateTime)
    suspend fun updatePasswordResetToken(id: UUID, token: String, expiresAt: LocalDateTime)
    suspend fun updatePasswordAndClearResetToken(id: UUID, passwordHash: String)
    suspend fun findAllUserInterests(userId: UUID): List<Category>
    suspend fun findAllUserInterestsTree(userId: UUID): List<CategoryTree>
    suspend fun addUserInterests(userId: UUID, newInterests: Set<UUID>)
    suspend fun removeUserInterests(userId: UUID, categoriesToDelete: Set<UUID>)
    suspend fun findByEmailToReset(email: String): Record3<UUID?, LocalDateTime?, String?>?
    suspend fun findAllUserIndustries(userId: UUID): List<Category>
    suspend fun addUserIndustries(userId: UUID, newIndustries: Set<UUID>)
    suspend fun removeUserIndustries(userId: UUID, industriesToRemove: Set<UUID>)
    suspend fun fetchUserOnboardingStatusById(userId: UUID): Record2<UUID?, LocalDateTime?>?
    suspend fun hasIndustries(userId: UUID): Boolean
    suspend fun updateOnboardingStatus(id: UUID, now: LocalDateTime)
    suspend fun hasInterests(userId: UUID): Boolean
    suspend fun boostIndustry(userId: UUID, categoryId: UUID, expiresAt: LocalDateTime)
    suspend fun unboostIndustry(userId: UUID, categoryId: UUID)
    suspend fun findAllUserIndustriesWithBoostStatus(userId: UUID): List<Category>
    suspend fun findAllUserIndustriesTreeWithBoostStatus(userId: UUID): List<CategoryTree>

    // Search-related methods
    suspend fun getUserIndustries(userId: UUID): List<Category>
    suspend fun getUserInterests(userId: UUID): List<Category>
    suspend fun findUsersByInterests(interestIds: List<UUID>): List<UUID>
    suspend fun findUsersByIndustries(industryIds: List<UUID>): List<UUID>
    suspend fun findByIds(userIds: List<UUID>): List<DomainUser>
    suspend fun getUsersIndustries(userIds: List<UUID>): Map<UUID, List<Category>>
    suspend fun getUsersInterests(userIds: List<UUID>): Map<UUID, List<Category>>
    suspend fun findPublicProfileDetails(
        targetUserId: UUID,
        currentUserId: UUID
    ): PublicProfileDetailsDTO.Output?

    suspend fun findUserTypeWithProfileId(userId: UUID): Record4<UUID?, String?, String?, UUID?>?
}

data class UserWithProfile(
    val user: DomainUser,
    val businessProfile: BusinessProfile? = null,
    val individualProfile: IndividualProfile? = null,
    val adminProfile: AdminProfile? = null
)

@Repository
class JooqUserRepository(
    private val dsl: DSLContext,
    private val transactionalOperator: TransactionalOperator
) : UserRepository {

    override suspend fun save(user: DomainUser): DomainUser {
        return transactionalOperator.executeAndAwait {
            if (user.id == UUID(0, 0)) {
                // New user - let database generate UUID using PostgreSQL uuidv7() function
                val record = dsl.insertInto(USERS)
                    .set(USERS.EMAIL, user.email)
                    .set(USERS.PASSWORD_HASH, user.passwordHash)
                    .set(USERS.USER_TYPE, user.userType!!.name)
                    .set(USERS.LINKEDIN_ID, user.linkedinId)
                    .set(USERS.ACTIVATED_AT, user.activatedAt)
                    .set(USERS.VERIFIED_AT, user.verifiedAt)
                    .set(USERS.VERIFICATION_TOKEN, user.verificationToken)
                    .set(USERS.RESET_PASSWORD_TOKEN, user.resetPasswordToken)
                    .set(USERS.RESET_PASSWORD_EXPIRES_AT, user.resetPasswordExpiresAt)
                    .set(USERS.CREATED_AT, user.createdAt)
                    .set(USERS.UPDATED_AT, user.updatedAt)
                    .returningResult()
                    .awaitFirst()

                user.copy(id = record.get(USERS.ID)!!)
            } else {
                // Update existing user
                dsl.update(USERS)
                    .set(USERS.EMAIL, user.email)
                    .set(USERS.PASSWORD_HASH, user.passwordHash)
                    .set(USERS.USER_TYPE, user.userType!!.name)
                    .set(USERS.LINKEDIN_ID, user.linkedinId)
                    .set(USERS.ACTIVATED_AT, user.activatedAt)
                    .set(USERS.VERIFIED_AT, user.verifiedAt)
                    .set(USERS.VERIFICATION_TOKEN, user.verificationToken)
                    .set(USERS.RESET_PASSWORD_TOKEN, user.resetPasswordToken)
                    .set(USERS.RESET_PASSWORD_EXPIRES_AT, user.resetPasswordExpiresAt)
                    .set(USERS.UPDATED_AT, LocalDateTime.now())
                    .where(USERS.ID.eq(user.id))
                    .awaitFirst()

                user.copy(updatedAt = LocalDateTime.now())
            }
        }
    }

    override suspend fun findById(id: UUID): DomainUser? {
        return dsl.selectFrom(USERS)
            .where(USERS.ID.eq(id))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToUser(it) }
    }

    override suspend fun findByEmail(email: String): DomainUser? {
        return dsl.selectFrom(USERS)
            .where(USERS.EMAIL.eq(email))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToUser(it) }
    }

    override suspend fun findByIdOrEmailWithRolesAndPermissions(id: UUID?, email: String?): DomainUser? {
        val condition = if (email.isNullOrBlank().not()) USERS.EMAIL.eq(email) else USERS.ID.eq(id!!)
        return dsl.select(
            USERS.ID,
            USERS.EMAIL,
            USERS.USER_TYPE,
            USERS.PASSWORD_HASH,
            USERS.ACTIVATED_AT,
            USERS.VERIFIED_AT,
            USERS.ONBOARDING_COMPLETED_AT,
            DSL.arrayRemove(DSL.arrayAggDistinct(ROLES.NAME), DSL.`val`(null, String::class.java)).`as`("roles"),
            DSL.arrayRemove(DSL.arrayAggDistinct(PERMISSIONS.NAME), DSL.`val`(null, String::class.java))
                .`as`("permissions"),
        )
            .from(USERS)
            .leftJoin(USER_ROLES).on(USERS.ID.eq(USER_ROLES.USER_ID))
            .leftJoin(ROLES).on(USER_ROLES.ROLE_ID.eq(ROLES.ID))
            .leftJoin(ROLE_PERMISSIONS).on(ROLE_PERMISSIONS.ROLE_ID.eq(ROLES.ID))
            .leftJoin(PERMISSIONS).on(ROLE_PERMISSIONS.PERMISSION_ID.eq(PERMISSIONS.ID))
            .where(condition)
            .and(USERS.DELETED_AT.isNull)
            .groupBy(USERS.ID)
            .awaitFirstOrNull()
            ?.let {
                val roles =
                    it["roles", Array<String>::class.java]?.toSet() ?: emptySet()
                val permissions =
                    it["permissions", Array<String>::class.java]?.toSet() ?: emptySet()
                DomainUser(
                    id = it[USERS.ID]!!,
                    email = it[USERS.EMAIL]!!,
                    userType = it[USERS.USER_TYPE]?.let { UserType.valueOf(it) },
                    passwordHash = it[USERS.PASSWORD_HASH],
                    activatedAt = it[USERS.ACTIVATED_AT],
                    verifiedAt = it[USERS.VERIFIED_AT],
                    roles = roles,
                    permissions = permissions,
                    onboardingCompletedAt = it[USERS.ONBOARDING_COMPLETED_AT],
                )
            }
    }

    override suspend fun findByLinkedinId(linkedinId: String): DomainUser? {
        return dsl.selectFrom(USERS)
            .where(USERS.LINKEDIN_ID.eq(linkedinId))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToUser(it) }
    }

    override suspend fun existsByEmail(email: String): Boolean {
        return dsl.selectCount()
            .from(USERS)
            .where(USERS.EMAIL.eq(email))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirst()
            .value1() > 0
    }

    override suspend fun existsById(id: UUID): Boolean {
        return dsl.selectCount()
            .from(USERS)
            .where(USERS.ID.eq(id))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirst()
            .value1() > 0
    }

    override suspend fun delete(id: UUID) {
        dsl.update(USERS)
            .set(USERS.DELETED_AT, LocalDateTime.now())
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun findUserWithProfile(id: UUID): UserWithProfile? {
        return transactionalOperator.executeAndAwait {
            val user = dsl.selectFrom(USERS)
                .where(USERS.ID.eq(id))
                .and(USERS.DELETED_AT.isNull)
                .awaitFirstOrNull()
                ?.let { mapRecordToUser(it) }
                ?: return@executeAndAwait null

            when (user.userType!!) {
                UserType.BUSINESS -> {
                    val businessProfile = dsl.selectFrom(BUSINESS_PROFILES)
                        .where(BUSINESS_PROFILES.USER_ID.eq(id))
                        .and(BUSINESS_PROFILES.DELETED_AT.isNull)
                        .awaitFirstOrNull()
                        ?.let { mapRecordToBusinessProfile(it) }

                    UserWithProfile(user, businessProfile = businessProfile)
                }

                UserType.INDIVIDUAL -> {
                    val individualProfile = dsl.selectFrom(INDIVIDUAL_PROFILES)
                        .where(INDIVIDUAL_PROFILES.USER_ID.eq(id))
                        .and(INDIVIDUAL_PROFILES.DELETED_AT.isNull)
                        .awaitFirstOrNull()
                        ?.let { mapRecordToIndividualProfile(it) }

                    UserWithProfile(user, individualProfile = individualProfile)
                }

                UserType.ADMIN -> {
                    val adminProfile = dsl.selectFrom(ADMIN_PROFILES)
                        .where(ADMIN_PROFILES.USER_ID.eq(id))
                        .and(ADMIN_PROFILES.DELETED_AT.isNull)
                        .awaitFirstOrNull()
                        ?.let { mapRecordToAdminProfile(it) }

                    UserWithProfile(user, adminProfile = adminProfile)
                }
            }
        }
    }

    override suspend fun updatePassword(id: UUID, passwordHash: String) {
        dsl.update(USERS)
            .set(USERS.PASSWORD_HASH, passwordHash)
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.ID.eq(id))
            .awaitFirst()
    }


    override suspend fun updateActivationStatus(id: UUID, activatedAt: LocalDateTime) {
        dsl.update(USERS)
            .set(USERS.ACTIVATED_AT, activatedAt)
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun findByVerificationToken(token: String): Record6<UUID?, String?, String?, LocalDateTime?, LocalDateTime?, String?>? {
        return dsl.select(
            USERS.ID,
            USERS.EMAIL,
            USERS.USER_TYPE,
            USERS.CREATED_AT,
            USERS.VERIFIED_AT,
            DSL.coalesce(BUSINESS_PROFILES.COMPANY_NAME, INDIVIDUAL_PROFILES.NAME, ADMIN_PROFILES.NAME)
                .`as`("profile_name")
        )
            .from(USERS)
            .leftJoin(BUSINESS_PROFILES).on(BUSINESS_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(INDIVIDUAL_PROFILES).on(INDIVIDUAL_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(ADMIN_PROFILES).on(ADMIN_PROFILES.USER_ID.eq(USERS.ID))
            .where(USERS.VERIFICATION_TOKEN.eq(token))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirstOrNull()
    }

    override suspend fun findByPasswordResetToken(token: String): DomainUser? {
        return dsl.selectFrom(USERS)
            .where(USERS.RESET_PASSWORD_TOKEN.eq(token))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToUser(it) }
    }

    override suspend fun updateVerificationStatus(id: UUID, verifiedAt: LocalDateTime, activatedAt: LocalDateTime) {
        dsl.update(USERS)
            .set(USERS.VERIFIED_AT, verifiedAt)
            .set(USERS.ACTIVATED_AT, activatedAt)
            .set(USERS.VERIFICATION_TOKEN, null as String?)
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun updatePasswordResetToken(id: UUID, token: String, expiresAt: LocalDateTime) {
        dsl.update(USERS)
            .set(USERS.RESET_PASSWORD_TOKEN, token)
            .set(USERS.RESET_PASSWORD_EXPIRES_AT, expiresAt)
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun updatePasswordAndClearResetToken(id: UUID, passwordHash: String) {
        dsl.update(USERS)
            .set(USERS.PASSWORD_HASH, passwordHash)
            .set(USERS.RESET_PASSWORD_TOKEN, null as String?)
            .set(USERS.RESET_PASSWORD_EXPIRES_AT, null as LocalDateTime?)
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun findAllUserInterests(userId: UUID): List<Category> {
        return dsl.selectDistinct(CATEGORIES.ID, CATEGORIES.NAME, CATEGORIES.DESCRIPTION)
            .from(USER_INTERESTS)
            .leftJoin(CATEGORIES).on(CATEGORIES.ID.eq(USER_INTERESTS.CATEGORY_ID))
            .where(USER_INTERESTS.USER_ID.eq(userId))
            .and(CATEGORIES.DELETED_AT.isNull)
            .and(CATEGORIES.ACTIVATED_AT.isNotNull)
            .orderBy(CATEGORIES.NAME)
            .awaitList()
            .map {
                Category(
                    id = it[CATEGORIES.ID]!!,
                    name = it[CATEGORIES.NAME]!!,
                    description = it[CATEGORIES.DESCRIPTION]
                )
            }
    }

    override suspend fun findAllUserInterestsTree(userId: UUID): List<CategoryTree> {
        val parentCategory = CATEGORIES.`as`("parent_category")
        val subCategory = CATEGORIES.`as`("sub_category")
        return dsl.select(
            parentCategory.ID,
            parentCategory.NAME,
            parentCategory.DESCRIPTION,
            DSL.multisetAgg(
                subCategory.ID,
                subCategory.NAME,
                subCategory.DESCRIPTION,
            ).`as`("sub_categories")
        )
            .from(USER_INTERESTS)
            .leftJoin(subCategory).on(subCategory.ID.eq(USER_INTERESTS.CATEGORY_ID))
            .leftJoin(parentCategory).on(parentCategory.ID.eq(subCategory.PARENT_ID))
            .where(USER_INTERESTS.USER_ID.eq(userId))
            .and(parentCategory.ID.isNotNull)
            .groupBy(parentCategory.ID)
            .awaitList()
            .map {
                CategoryTree(
                    id = it[parentCategory.ID]!!,
                    name = it[parentCategory.NAME]!!,
                    description = it[parentCategory.DESCRIPTION],
                    subCategories = it["sub_categories", Array<CategoryTree.SubCategory>::class.java]?.toList()
                        ?: emptyList()
                )
            }
    }

    override suspend fun findAllUserIndustries(userId: UUID): List<Category> {
        return dsl.selectDistinct(CATEGORIES.ID, CATEGORIES.NAME, CATEGORIES.DESCRIPTION)
            .from(USER_INDUSTRIES)
            .leftJoin(CATEGORIES).on(CATEGORIES.ID.eq(USER_INDUSTRIES.CATEGORY_ID))
            .where(USER_INDUSTRIES.USER_ID.eq(userId))
            .and(CATEGORIES.DELETED_AT.isNull)
            .and(CATEGORIES.ACTIVATED_AT.isNotNull)
            .orderBy(CATEGORIES.NAME)
            .awaitList()
            .map {
                Category(
                    id = it[CATEGORIES.ID]!!,
                    name = it[CATEGORIES.NAME]!!,
                    description = it[CATEGORIES.DESCRIPTION]
                )
            }
    }

    override suspend fun addUserInterests(userId: UUID, newInterests: Set<UUID>) {
        if (newInterests.isEmpty()) return

        transactionalOperator.executeAndAwait {
            newInterests.forEach {
                dsl.insertInto(USER_INTERESTS)
                    .set(USER_INTERESTS.USER_ID, userId)
                    .set(USER_INTERESTS.CATEGORY_ID, it)
                    .onConflictDoNothing() // Avoid duplicates
                    .awaitFirst()
            }
        }
    }

    override suspend fun addUserIndustries(userId: UUID, newIndustries: Set<UUID>) {
        if (newIndustries.isEmpty()) return

        transactionalOperator.executeAndAwait {
            newIndustries.forEach {
                dsl.insertInto(USER_INDUSTRIES)
                    .set(USER_INDUSTRIES.USER_ID, userId)
                    .set(USER_INDUSTRIES.CATEGORY_ID, it)
                    .onConflictDoNothing() // Avoid duplicates
                    .awaitFirst()
            }
        }
    }

    override suspend fun removeUserInterests(
        userId: UUID,
        categoriesToDelete: Set<UUID>
    ) {
        if (categoriesToDelete.isEmpty()) return

        transactionalOperator.executeAndAwait {
            dsl.deleteFrom(USER_INTERESTS)
                .where(USER_INTERESTS.USER_ID.eq(userId))
                .and(USER_INTERESTS.CATEGORY_ID.`in`(categoriesToDelete))
                .awaitFirst()
        }
    }

    override suspend fun removeUserIndustries(
        userId: UUID,
        industriesToRemove: Set<UUID>
    ) {
        if (industriesToRemove.isEmpty()) return

        transactionalOperator.executeAndAwait {
            dsl.deleteFrom(USER_INDUSTRIES)
                .where(USER_INDUSTRIES.USER_ID.eq(userId))
                .and(USER_INDUSTRIES.CATEGORY_ID.`in`(industriesToRemove))
                .awaitFirst()
        }
    }

    override suspend fun fetchUserOnboardingStatusById(userId: UUID): Record2<UUID?, LocalDateTime?>? {
        return dsl.select(USERS.ID, USERS.ONBOARDING_COMPLETED_AT)
            .from(USERS)
            .where(USERS.ID.eq(userId))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirstOrNull()
    }

    override suspend fun hasIndustries(userId: UUID): Boolean {
        return dsl.selectCount()
            .from(USER_INDUSTRIES)
            .where(USER_INDUSTRIES.USER_ID.eq(userId))
            .limit(1)
            .awaitFirst()
            .value1() > 0
    }

    override suspend fun updateOnboardingStatus(id: UUID, now: LocalDateTime) {
        dsl.update(USERS)
            .set(USERS.ONBOARDING_COMPLETED_AT, now)
            .set(USERS.UPDATED_AT, LocalDateTime.now())
            .where(USERS.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun hasInterests(userId: UUID): Boolean {
        return dsl.selectCount()
            .from(USER_INTERESTS)
            .where(USER_INTERESTS.USER_ID.eq(userId))
            .limit(1)
            .awaitFirst()
            .value1() > 0
    }

    override suspend fun boostIndustry(userId: UUID, categoryId: UUID, expiresAt: LocalDateTime) {
        dsl.update(USER_INDUSTRIES)
            .set(USER_INDUSTRIES.IS_BOOSTED, true)
            .set(USER_INDUSTRIES.BOOST_EXPIRES_AT, expiresAt)
            .where(USER_INDUSTRIES.USER_ID.eq(userId))
            .and(USER_INDUSTRIES.CATEGORY_ID.eq(categoryId))
            .awaitFirst()
    }

    override suspend fun unboostIndustry(userId: UUID, categoryId: UUID) {
        dsl.update(USER_INDUSTRIES)
            .set(USER_INDUSTRIES.IS_BOOSTED, false)
            .set(USER_INDUSTRIES.BOOST_EXPIRES_AT, null as LocalDateTime?)
            .where(USER_INDUSTRIES.USER_ID.eq(userId))
            .and(USER_INDUSTRIES.CATEGORY_ID.eq(categoryId))
            .awaitFirst()
    }

    override suspend fun findAllUserIndustriesWithBoostStatus(userId: UUID): List<Category> {
        return dsl.select(
            CATEGORIES.ID,
            CATEGORIES.NAME,
            CATEGORIES.DESCRIPTION,
            USER_INDUSTRIES.IS_BOOSTED,
            USER_INDUSTRIES.BOOST_EXPIRES_AT
        )
            .from(USER_INDUSTRIES)
            .leftJoin(CATEGORIES).on(CATEGORIES.ID.eq(USER_INDUSTRIES.CATEGORY_ID))
            .where(USER_INDUSTRIES.USER_ID.eq(userId))
            .and(CATEGORIES.DELETED_AT.isNull)
            .and(CATEGORIES.ACTIVATED_AT.isNotNull)
            .orderBy(CATEGORIES.NAME)
            .awaitList()
            .map {
                Category(
                    id = it[CATEGORIES.ID]!!,
                    name = it[CATEGORIES.NAME]!!,
                    description = it[CATEGORIES.DESCRIPTION],
                    isBoosted = it[USER_INDUSTRIES.IS_BOOSTED] ?: false,
                    boostExpiresAt = it[USER_INDUSTRIES.BOOST_EXPIRES_AT]
                )
            }
    }

    override suspend fun findAllUserIndustriesTreeWithBoostStatus(userId: UUID): List<CategoryTree> {
        val parentCategory = CATEGORIES.`as`("parent_category")
        val subCategory = CATEGORIES.`as`("sub_category")
        return dsl.select(
            parentCategory.ID,
            parentCategory.NAME,
            parentCategory.DESCRIPTION,
            DSL.multisetAgg(
                subCategory.ID,
                subCategory.NAME,
                subCategory.DESCRIPTION,
                USER_INDUSTRIES.IS_BOOSTED,
                USER_INDUSTRIES.BOOST_EXPIRES_AT
            ).`as`("sub_categories")
        )
            .from(USER_INDUSTRIES)
            .leftJoin(subCategory).on(subCategory.ID.eq(USER_INDUSTRIES.CATEGORY_ID))
            .leftJoin(parentCategory).on(parentCategory.ID.eq(subCategory.PARENT_ID))
            .where(USER_INDUSTRIES.USER_ID.eq(userId))
            .and(parentCategory.ID.isNotNull)
            .groupBy(parentCategory.ID)
            .awaitList()
            .map {
                CategoryTree(
                    id = it[parentCategory.ID]!!,
                    name = it[parentCategory.NAME]!!,
                    description = it[parentCategory.DESCRIPTION],
                    subCategories = it["sub_categories", Array<CategoryTree.SubCategory>::class.java]?.toList()
                        ?: emptyList()
                )
            }
    }

    // Search-related method implementations
    override suspend fun getUserIndustries(userId: UUID): List<Category> {
        return findAllUserIndustries(userId)
    }

    override suspend fun getUserInterests(userId: UUID): List<Category> {
        return findAllUserInterests(userId)
    }

    override suspend fun findUsersByInterests(interestIds: List<UUID>): List<UUID> {
        if (interestIds.isEmpty()) return emptyList()

        return dsl.selectDistinct(USER_INTERESTS.USER_ID)
            .from(USER_INTERESTS)
            .where(USER_INTERESTS.CATEGORY_ID.`in`(interestIds))
            .and(USER_INTERESTS.DELETED_AT.isNull)
            .awaitList()
            .map { it[USER_INTERESTS.USER_ID]!! }
    }

    override suspend fun findUsersByIndustries(industryIds: List<UUID>): List<UUID> {
        if (industryIds.isEmpty()) return emptyList()

        return dsl.selectDistinct(USER_INDUSTRIES.USER_ID)
            .from(USER_INDUSTRIES)
            .where(USER_INDUSTRIES.CATEGORY_ID.`in`(industryIds))
            .and(USER_INDUSTRIES.DELETED_AT.isNull)
            .awaitList()
            .map { it[USER_INDUSTRIES.USER_ID]!! }
    }

    override suspend fun findByIds(userIds: List<UUID>): List<DomainUser> {
        if (userIds.isEmpty()) return emptyList()

        return dsl.selectFrom(USERS)
            .where(USERS.ID.`in`(userIds))
            .and(USERS.DELETED_AT.isNull)
            .awaitList()
            .map { mapRecordToUser(it) }
    }

    override suspend fun getUsersIndustries(userIds: List<UUID>): Map<UUID, List<Category>> {
        if (userIds.isEmpty()) return emptyMap()

        val results = dsl.select(
            USER_INDUSTRIES.USER_ID,
            CATEGORIES.ID,
            CATEGORIES.NAME,
            CATEGORIES.DESCRIPTION
        )
            .from(USER_INDUSTRIES)
            .leftJoin(CATEGORIES).on(CATEGORIES.ID.eq(USER_INDUSTRIES.CATEGORY_ID))
            .where(USER_INDUSTRIES.USER_ID.`in`(userIds))
            .and(CATEGORIES.DELETED_AT.isNull)
            .and(CATEGORIES.ACTIVATED_AT.isNotNull)
            .awaitList()

        return results.groupBy(
            { it[USER_INDUSTRIES.USER_ID]!! },
            {
                Category(
                    id = it[CATEGORIES.ID]!!,
                    name = it[CATEGORIES.NAME]!!,
                    description = it[CATEGORIES.DESCRIPTION]
                )
            }
        )
    }

    override suspend fun getUsersInterests(userIds: List<UUID>): Map<UUID, List<Category>> {
        if (userIds.isEmpty()) return emptyMap()

        val results = dsl.select(
            USER_INTERESTS.USER_ID,
            CATEGORIES.ID,
            CATEGORIES.NAME,
            CATEGORIES.DESCRIPTION
        )
            .from(USER_INTERESTS)
            .leftJoin(CATEGORIES).on(CATEGORIES.ID.eq(USER_INTERESTS.CATEGORY_ID))
            .where(USER_INTERESTS.USER_ID.`in`(userIds))
            .and(CATEGORIES.DELETED_AT.isNull)
            .and(CATEGORIES.ACTIVATED_AT.isNotNull)
            .awaitList()

        return results.groupBy(
            { it[USER_INTERESTS.USER_ID]!! },
            {
                Category(
                    id = it[CATEGORIES.ID]!!,
                    name = it[CATEGORIES.NAME]!!,
                    description = it[CATEGORIES.DESCRIPTION]
                )
            }
        )
    }

    override suspend fun findPublicProfileDetails(
        targetUserId: UUID,
        currentUserId: UUID
    ): PublicProfileDetailsDTO.Output? {
        val industryCat = CATEGORIES.`as`("industry_cat")
        val interestCat = CATEGORIES.`as`("interest_cat")
        val user = dsl.select(
            USERS.ID,
            DSL.coalesce(BUSINESS_PROFILES.COMPANY_NAME, INDIVIDUAL_PROFILES.NAME, ADMIN_PROFILES.NAME)
                .`as`("name"),
            USERS.EMAIL,
            DSL.coalesce(BUSINESS_PROFILES.COMPANY_PHONE, INDIVIDUAL_PROFILES.PHONE, ADMIN_PROFILES.PHONE)
                .`as`("phone"),
            DSL.arrayAnyMatch(DSL.arrayAgg(USER_INDUSTRIES.IS_BOOSTED)) { it.isTrue }.`as`("boosted"),
            DSL.arrayAggDistinct(industryCat.NAME).`as`("industries"),
            DSL.arrayAggDistinct(interestCat.NAME).`as`("interests"),
            DSL.coalesce(BUSINESS_PROFILES.REGISTRATION_COUNTRY, INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY)
                .`as`("countryOfRegistration"),
            DSL.coalesce(BUSINESS_PROFILES.RESIDENCE_COUNTRY, INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY)
                .`as`("countryOfResidence"),
            CONNECTION_REQUESTS.STATUS.`as`("connectionStatus"),
            CONNECTION_REQUESTS.SENDER_ID.`as`("connectionSenderId"),
            DSL.coalesce(BUSINESS_PROFILES.BIOGRAPHY, INDIVIDUAL_PROFILES.BIOGRAPHY)
                .`as`("biography"),
            DSL.coalesce(BUSINESS_PROFILES.PROFILE_PICTURE_URL, INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL)
                .`as`("profilePictureUrl"),
            USERS.CREATED_AT.`as`("joinedAt")
        )
            .from(USERS)
            .leftJoin(BUSINESS_PROFILES).on(BUSINESS_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(INDIVIDUAL_PROFILES).on(INDIVIDUAL_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(ADMIN_PROFILES).on(ADMIN_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(USER_INDUSTRIES).on(USER_INDUSTRIES.USER_ID.eq(USERS.ID))
            .leftJoin(industryCat).on(industryCat.ID.eq(USER_INDUSTRIES.CATEGORY_ID))
            .leftJoin(USER_INTERESTS).on(USER_INTERESTS.USER_ID.eq(USERS.ID))
            .leftJoin(interestCat).on(interestCat.ID.eq(USER_INTERESTS.CATEGORY_ID))
            .leftJoin(CONNECTION_REQUESTS).on(
                CONNECTION_REQUESTS.SENDER_ID.eq(currentUserId).and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(USERS.ID))
                    .or(
                        CONNECTION_REQUESTS.SENDER_ID.eq(USERS.ID)
                            .and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(currentUserId))
                    )
                    .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            )
            .where(USERS.ID.eq(targetUserId))
            .and(USERS.DELETED_AT.isNull)
            .groupBy(
                USERS.ID,
                BUSINESS_PROFILES.ID,
                INDIVIDUAL_PROFILES.ID,
                ADMIN_PROFILES.ID,
                CONNECTION_REQUESTS.ID
            )
            .awaitFirstOrNull()

        return user?.let {
            val connectionStatus = it["connectionStatus", String::class.java]
            val connectionSenderId = it["connectionSenderId", String::class.java]
            PublicProfileDetailsDTO.Output(
                userId = it[USERS.ID]?.toString(),
                name = it["name", String::class.java],
                email = it[USERS.EMAIL],
                phone = it["phone", String::class.java],
                boosted = it["boosted", Boolean::class.java],
                industries = it["industries", Array<String>::class.java]?.toSet(),
                interests = it["interests", Array<String>::class.java]?.toSet(),
                countryOfRegistration = it["countryOfRegistration", String::class.java],
                countryOfResidence = it["countryOfResidence", String::class.java],
                connectionStatus = when (connectionStatus) {
                    "PENDING" -> {
                        // For pending requests, check who sent it to determine the correct status
                        if (connectionSenderId == currentUserId.toString()) {
                            PublicProfileDetailsDTO.ConnectionStatus.REQUEST_SENT
                        } else {
                            PublicProfileDetailsDTO.ConnectionStatus.REQUEST_RECEIVED
                        }
                    }

                    "ACCEPTED" -> PublicProfileDetailsDTO.ConnectionStatus.CONNECTED
                    "REJECTED" -> PublicProfileDetailsDTO.ConnectionStatus.REQUEST_REJECTED
                    "CANCELLED" -> PublicProfileDetailsDTO.ConnectionStatus.REQUEST_CANCELLED
                    else -> null
                },
                biography = it["biography", String::class.java],
                profilePictureUrl = it["profilePictureUrl", String::class.java],
                joinedAt = it["joinedAt", LocalDateTime::class.java]?.format(
                    DateTimeFormatter.ofPattern("MMM d, yyyy")
                )
            )
        }
    }

    override suspend fun findUserTypeWithProfileId(userId: UUID): Record4<UUID?, String?, String?, UUID?>? {
        return dsl.select(
            USERS.ID,
            USERS.EMAIL,
            USERS.USER_TYPE,
            DSL.coalesce(BUSINESS_PROFILES.ID, INDIVIDUAL_PROFILES.ID, ADMIN_PROFILES.ID).`as`("profile_id"),
        ).from(USERS)
            .leftJoin(BUSINESS_PROFILES).on(BUSINESS_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(INDIVIDUAL_PROFILES).on(INDIVIDUAL_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(ADMIN_PROFILES).on(ADMIN_PROFILES.USER_ID.eq(USERS.ID))
            .where(USERS.ID.eq(userId))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirstOrNull()
    }

    override suspend fun findByEmailToReset(email: String): Record3<UUID?, LocalDateTime?, String?>? {
        return dsl.select(
            USERS.ID,
            USERS.ACTIVATED_AT,
            DSL.coalesce(BUSINESS_PROFILES.COMPANY_NAME, INDIVIDUAL_PROFILES.NAME, ADMIN_PROFILES.NAME)
                .`as`("profile_name")
        )
            .from(USERS)
            .leftJoin(BUSINESS_PROFILES).on(BUSINESS_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(INDIVIDUAL_PROFILES).on(INDIVIDUAL_PROFILES.USER_ID.eq(USERS.ID))
            .leftJoin(ADMIN_PROFILES).on(ADMIN_PROFILES.USER_ID.eq(USERS.ID))
            .where(USERS.EMAIL.eq(email))
            .and(USERS.DELETED_AT.isNull)
            .awaitFirstOrNull()
    }

    private fun mapRecordToUser(record: Record): DomainUser {
        return DomainUser(
            id = record.get(USERS.ID)!!,
            email = record.get(USERS.EMAIL)!!,
            passwordHash = record.get(USERS.PASSWORD_HASH),
            userType = record.get(USERS.USER_TYPE)?.let { UserType.valueOf(it) },
            linkedinId = record.get(USERS.LINKEDIN_ID),
            activatedAt = record.get(USERS.ACTIVATED_AT),
            verifiedAt = record.get(USERS.VERIFIED_AT),
            verificationToken = record.get(USERS.VERIFICATION_TOKEN),
            resetPasswordToken = record.get(USERS.RESET_PASSWORD_TOKEN),
            resetPasswordExpiresAt = record.get(USERS.RESET_PASSWORD_EXPIRES_AT),
            deletedAt = record.get(USERS.DELETED_AT),
            createdAt = record.get(USERS.CREATED_AT),
            updatedAt = record.get(USERS.UPDATED_AT),
            onboardingCompletedAt = record.get(USERS.ONBOARDING_COMPLETED_AT),
        )
    }

    private fun mapRecordToBusinessProfile(record: Record): BusinessProfile {
        return BusinessProfile(
            id = record.get(BUSINESS_PROFILES.ID)!!,
            userId = record.get(BUSINESS_PROFILES.USER_ID)!!,
            companyName = record.get(BUSINESS_PROFILES.COMPANY_NAME)!!,
            companyEmail = record.get(BUSINESS_PROFILES.COMPANY_EMAIL),
            companyPhone = record.get(BUSINESS_PROFILES.COMPANY_PHONE),
            ownerName = record.get(BUSINESS_PROFILES.PERSONAL_NAME)!!,
            ownerPersonalEmail = record.get(BUSINESS_PROFILES.PERSONAL_EMAIL),
            biography = record.get(BUSINESS_PROFILES.BIOGRAPHY),
            registrationCountry = record.get(BUSINESS_PROFILES.REGISTRATION_COUNTRY) ?: "",
            residenceCountry = record.get(BUSINESS_PROFILES.RESIDENCE_COUNTRY),
            location = record.get(BUSINESS_PROFILES.LOCATION_DATA)?.toString(),
            profileImageUrl = record.get(BUSINESS_PROFILES.PROFILE_PICTURE_URL),
            coverImageUrl = record.get(BUSINESS_PROFILES.COVER_PICTURE_URL),
            deletedAt = record.get(BUSINESS_PROFILES.DELETED_AT),
            createdAt = record.get(BUSINESS_PROFILES.CREATED_AT)!!,
            updatedAt = record.get(BUSINESS_PROFILES.UPDATED_AT)!!
        )
    }

    private fun mapRecordToIndividualProfile(record: Record): IndividualProfile {
        return IndividualProfile(
            id = record.get(INDIVIDUAL_PROFILES.ID)!!,
            userId = record.get(INDIVIDUAL_PROFILES.USER_ID)!!,
            name = record.get(INDIVIDUAL_PROFILES.NAME)!!,
            phone = record.get(INDIVIDUAL_PROFILES.PHONE),
            biography = record.get(INDIVIDUAL_PROFILES.BIOGRAPHY),
            nationality = record.get(INDIVIDUAL_PROFILES.NATIONALITY) ?: "",
            residenceCountry = record.get(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY),
            location = record.get(INDIVIDUAL_PROFILES.LOCATION_DATA)?.toString(),
            profileImageUrl = record.get(INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL),
            coverImageUrl = record.get(INDIVIDUAL_PROFILES.COVER_PICTURE_URL),
            deletedAt = record.get(INDIVIDUAL_PROFILES.DELETED_AT),
            createdAt = record.get(INDIVIDUAL_PROFILES.CREATED_AT)!!,
            updatedAt = record.get(INDIVIDUAL_PROFILES.UPDATED_AT)!!
        )
    }

    private fun mapRecordToAdminProfile(record: Record): AdminProfile {
        return AdminProfile(
            id = record.get(ADMIN_PROFILES.ID)!!,
            userId = record.get(ADMIN_PROFILES.USER_ID)!!,
            name = record.get(ADMIN_PROFILES.NAME)!!,
            department = record.get(ADMIN_PROFILES.DEPARTMENT),
            jobTitle = record.get(ADMIN_PROFILES.JOB_TITLE),
            phone = record.get(ADMIN_PROFILES.PHONE),
            notes = record.get(ADMIN_PROFILES.NOTES),
            deletedAt = record.get(ADMIN_PROFILES.DELETED_AT),
            createdAt = record.get(ADMIN_PROFILES.CREATED_AT)!!,
            updatedAt = record.get(ADMIN_PROFILES.UPDATED_AT)!!
        )
    }
}
