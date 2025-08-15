package com.pbi.api.repository

import com.pbi.api.config.awaitList
import com.pbi.api.domain.BusinessProfile
import com.pbi.generated.tables.BusinessProfiles.Companion.BUSINESS_PROFILES
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.jooq.DSLContext
import org.jooq.JSONB
import org.jooq.Record
import org.jooq.kotlin.coroutines.transactionCoroutine
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

interface BusinessProfileRepository {
    suspend fun save(profile: BusinessProfile): BusinessProfile
    suspend fun findById(id: UUID): BusinessProfile?
    suspend fun findByUserId(userId: UUID): BusinessProfile?
    suspend fun findByCompanyName(companyName: String): BusinessProfile?
    suspend fun findByRegistrationCountry(country: String): List<BusinessProfile>
    suspend fun delete(id: UUID)
    suspend fun findByUserIds(userIds: List<UUID>): List<BusinessProfile>
    suspend fun getDistinctCountries(): List<String>
    suspend fun updateProfileDetails(
        profileId: UUID,
        name: String?,
        phone: String?,
        biography: String?,
        nationality: String?,
        countryOfResidence: String?
    )
}

@Repository
class JooqBusinessProfileRepository(
    private val dsl: DSLContext
) : BusinessProfileRepository {

    override suspend fun save(profile: BusinessProfile): BusinessProfile {
        return dsl.transactionCoroutine { configuration ->
            val ctx = configuration.dsl()
            if (profile.id == UUID(0, 0)) {
                // New profile - let database generate UUID using PostgreSQL uuidv7() function
                val record = ctx.insertInto(BUSINESS_PROFILES)
                    .set(BUSINESS_PROFILES.USER_ID, profile.userId)
                    .set(BUSINESS_PROFILES.COMPANY_NAME, profile.companyName)
                    .set(BUSINESS_PROFILES.COMPANY_EMAIL, profile.companyEmail)
                    .set(BUSINESS_PROFILES.COMPANY_PHONE, profile.companyPhone)
                    .set(BUSINESS_PROFILES.PERSONAL_NAME, profile.ownerName)
                    .set(BUSINESS_PROFILES.PERSONAL_EMAIL, profile.ownerPersonalEmail)
                    .set(BUSINESS_PROFILES.BIOGRAPHY, profile.biography)
                    .set(BUSINESS_PROFILES.REGISTRATION_COUNTRY, profile.registrationCountry)
                    .set(BUSINESS_PROFILES.RESIDENCE_COUNTRY, profile.residenceCountry)
                    .set(BUSINESS_PROFILES.LOCATION_DATA, profile.location?.let { JSONB.valueOf(it) })
                    .set(BUSINESS_PROFILES.PROFILE_PICTURE_URL, profile.profileImageUrl)
                    .set(BUSINESS_PROFILES.COVER_PICTURE_URL, profile.coverImageUrl)
                    .set(BUSINESS_PROFILES.CREATED_AT, profile.createdAt)
                    .set(BUSINESS_PROFILES.UPDATED_AT, profile.updatedAt)
                    .returningResult()
                    .awaitFirst()

                profile.copy(id = record.get(BUSINESS_PROFILES.ID)!!)
            } else {
                // Update existing profile
                ctx.update(BUSINESS_PROFILES)
                    .set(BUSINESS_PROFILES.USER_ID, profile.userId)
                    .set(BUSINESS_PROFILES.COMPANY_NAME, profile.companyName)
                    .set(BUSINESS_PROFILES.COMPANY_EMAIL, profile.companyEmail)
                    .set(BUSINESS_PROFILES.COMPANY_PHONE, profile.companyPhone)
                    .set(BUSINESS_PROFILES.PERSONAL_NAME, profile.ownerName)
                    .set(BUSINESS_PROFILES.PERSONAL_EMAIL, profile.ownerPersonalEmail)
                    .set(BUSINESS_PROFILES.BIOGRAPHY, profile.biography)
                    .set(BUSINESS_PROFILES.REGISTRATION_COUNTRY, profile.registrationCountry)
                    .set(BUSINESS_PROFILES.RESIDENCE_COUNTRY, profile.residenceCountry)
                    .set(BUSINESS_PROFILES.LOCATION_DATA, profile.location?.let { JSONB.valueOf(it) })
                    .set(BUSINESS_PROFILES.PROFILE_PICTURE_URL, profile.profileImageUrl)
                    .set(BUSINESS_PROFILES.COVER_PICTURE_URL, profile.coverImageUrl)
                    .set(BUSINESS_PROFILES.UPDATED_AT, LocalDateTime.now())
                    .where(BUSINESS_PROFILES.ID.eq(profile.id))
                    .awaitFirst()

                profile.copy(updatedAt = LocalDateTime.now())
            }
        }
    }

    override suspend fun findById(id: UUID): BusinessProfile? {
        return dsl.selectFrom(BUSINESS_PROFILES)
            .where(BUSINESS_PROFILES.ID.eq(id))
            .and(BUSINESS_PROFILES.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToBusinessProfile(it) }
    }

    override suspend fun findByUserId(userId: UUID): BusinessProfile? {
        return dsl.selectFrom(BUSINESS_PROFILES)
            .where(BUSINESS_PROFILES.USER_ID.eq(userId))
            .and(BUSINESS_PROFILES.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToBusinessProfile(it) }
    }

    override suspend fun findByCompanyName(companyName: String): BusinessProfile? {
        return dsl.selectFrom(BUSINESS_PROFILES)
            .where(BUSINESS_PROFILES.COMPANY_NAME.eq(companyName))
            .and(BUSINESS_PROFILES.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToBusinessProfile(it) }
    }

    override suspend fun findByRegistrationCountry(country: String): List<BusinessProfile> {
        return dsl.selectFrom(BUSINESS_PROFILES)
            .where(BUSINESS_PROFILES.REGISTRATION_COUNTRY.eq(country))
            .and(BUSINESS_PROFILES.DELETED_AT.isNull)
            .orderBy(BUSINESS_PROFILES.CREATED_AT.desc())
            .awaitFirstOrNull()
            ?.let { listOf(mapRecordToBusinessProfile(it)) }
            ?: emptyList()
    }

    override suspend fun delete(id: UUID) {
        dsl.update(BUSINESS_PROFILES)
            .set(BUSINESS_PROFILES.DELETED_AT, LocalDateTime.now())
            .set(BUSINESS_PROFILES.UPDATED_AT, LocalDateTime.now())
            .where(BUSINESS_PROFILES.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun findByUserIds(userIds: List<UUID>): List<BusinessProfile> {
        if (userIds.isEmpty()) return emptyList()

        return dsl.selectFrom(BUSINESS_PROFILES)
            .where(BUSINESS_PROFILES.USER_ID.`in`(userIds))
            .and(BUSINESS_PROFILES.DELETED_AT.isNull)
            .awaitList()
            .map { mapRecordToBusinessProfile(it) }
    }

    override suspend fun getDistinctCountries(): List<String> {
        return dsl.selectDistinct(BUSINESS_PROFILES.REGISTRATION_COUNTRY)
            .from(BUSINESS_PROFILES)
            .where(BUSINESS_PROFILES.REGISTRATION_COUNTRY.isNotNull)
            .and(BUSINESS_PROFILES.DELETED_AT.isNull)
            .awaitList()
            .mapNotNull { it[BUSINESS_PROFILES.REGISTRATION_COUNTRY] }
            .sorted()
    }

    override suspend fun updateProfileDetails(
        profileId: UUID,
        name: String?,
        phone: String?,
        biography: String?,
        nationality: String?,
        countryOfResidence: String?
    ) {
        dsl.update(BUSINESS_PROFILES)
            .apply {
                name?.let { set(BUSINESS_PROFILES.PERSONAL_NAME, it) }
                phone?.let { set(BUSINESS_PROFILES.COMPANY_PHONE, it) }
                biography?.let { set(BUSINESS_PROFILES.BIOGRAPHY, it) }
                nationality?.let { set(BUSINESS_PROFILES.REGISTRATION_COUNTRY, it) }
                countryOfResidence?.let { set(BUSINESS_PROFILES.RESIDENCE_COUNTRY, it) }
            }
            .set(BUSINESS_PROFILES.UPDATED_AT, LocalDateTime.now())
            .where(BUSINESS_PROFILES.ID.eq(profileId))
            .awaitFirst()
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
} 