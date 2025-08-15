package com.pbi.api.repository

import com.pbi.api.config.awaitList
import com.pbi.api.domain.IndividualProfile
import com.pbi.generated.tables.IndividualProfiles.Companion.INDIVIDUAL_PROFILES
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.jooq.DSLContext
import org.jooq.JSONB
import org.jooq.Record
import org.jooq.kotlin.coroutines.transactionCoroutine
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

interface IndividualProfileRepository {
    suspend fun save(profile: IndividualProfile): IndividualProfile
    suspend fun findById(id: UUID): IndividualProfile?
    suspend fun findByUserId(userId: UUID): IndividualProfile?
    suspend fun findByNationality(nationality: String): List<IndividualProfile>
    suspend fun findByResidenceCountry(country: String): List<IndividualProfile>
    suspend fun delete(id: UUID)
    suspend fun findByUserIds(userIds: List<UUID>): List<IndividualProfile>
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
class JooqIndividualProfileRepository(
    private val dsl: DSLContext
) : IndividualProfileRepository {

    override suspend fun save(profile: IndividualProfile): IndividualProfile {
        return dsl.transactionCoroutine { configuration ->
            val ctx = configuration.dsl()
            if (profile.id == UUID(0, 0)) {
                // New profile - let database generate UUID using PostgreSQL uuidv7() function
                val record = ctx.insertInto(INDIVIDUAL_PROFILES)
                    .set(INDIVIDUAL_PROFILES.USER_ID, profile.userId)
                    .set(INDIVIDUAL_PROFILES.NAME, profile.name)
                    .set(INDIVIDUAL_PROFILES.PHONE, profile.phone)
                    .set(INDIVIDUAL_PROFILES.BIOGRAPHY, profile.biography)
                    .set(INDIVIDUAL_PROFILES.NATIONALITY, profile.nationality)
                    .set(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY, profile.residenceCountry)
                    .set(INDIVIDUAL_PROFILES.LOCATION_DATA, profile.location?.let { JSONB.valueOf(it) })
                    .set(INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL, profile.profileImageUrl)
                    .set(INDIVIDUAL_PROFILES.COVER_PICTURE_URL, profile.coverImageUrl)
                    .set(INDIVIDUAL_PROFILES.CREATED_AT, profile.createdAt)
                    .set(INDIVIDUAL_PROFILES.UPDATED_AT, profile.updatedAt)
                    .returningResult()
                    .awaitFirst()

                profile.copy(id = record.get(INDIVIDUAL_PROFILES.ID)!!)
            } else {
                // Update existing profile
                ctx.update(INDIVIDUAL_PROFILES)
                    .set(INDIVIDUAL_PROFILES.USER_ID, profile.userId)
                    .set(INDIVIDUAL_PROFILES.NAME, profile.name)
                    .set(INDIVIDUAL_PROFILES.PHONE, profile.phone)
                    .set(INDIVIDUAL_PROFILES.BIOGRAPHY, profile.biography)
                    .set(INDIVIDUAL_PROFILES.NATIONALITY, profile.nationality)
                    .set(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY, profile.residenceCountry)
                    .set(INDIVIDUAL_PROFILES.LOCATION_DATA, profile.location?.let { JSONB.valueOf(it) })
                    .set(INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL, profile.profileImageUrl)
                    .set(INDIVIDUAL_PROFILES.COVER_PICTURE_URL, profile.coverImageUrl)
                    .set(INDIVIDUAL_PROFILES.UPDATED_AT, LocalDateTime.now())
                    .where(INDIVIDUAL_PROFILES.ID.eq(profile.id))
                    .awaitFirst()

                profile.copy(updatedAt = LocalDateTime.now())
            }
        }
    }

    override suspend fun findById(id: UUID): IndividualProfile? {
        return dsl.selectFrom(INDIVIDUAL_PROFILES)
            .where(INDIVIDUAL_PROFILES.ID.eq(id))
            .and(INDIVIDUAL_PROFILES.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToIndividualProfile(it) }
    }

    override suspend fun findByUserId(userId: UUID): IndividualProfile? {
        return dsl.selectFrom(INDIVIDUAL_PROFILES)
            .where(INDIVIDUAL_PROFILES.USER_ID.eq(userId))
            .and(INDIVIDUAL_PROFILES.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToIndividualProfile(it) }
    }

    override suspend fun findByNationality(nationality: String): List<IndividualProfile> {
        return dsl.selectFrom(INDIVIDUAL_PROFILES)
            .where(INDIVIDUAL_PROFILES.NATIONALITY.eq(nationality))
            .and(INDIVIDUAL_PROFILES.DELETED_AT.isNull)
            .orderBy(INDIVIDUAL_PROFILES.CREATED_AT.desc())
            .awaitFirstOrNull()
            ?.let { listOf(mapRecordToIndividualProfile(it)) }
            ?: emptyList()
    }

    override suspend fun findByResidenceCountry(country: String): List<IndividualProfile> {
        return dsl.selectFrom(INDIVIDUAL_PROFILES)
            .where(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY.eq(country))
            .and(INDIVIDUAL_PROFILES.DELETED_AT.isNull)
            .orderBy(INDIVIDUAL_PROFILES.CREATED_AT.desc())
            .awaitFirstOrNull()
            ?.let { listOf(mapRecordToIndividualProfile(it)) }
            ?: emptyList()
    }

    override suspend fun delete(id: UUID) {
        dsl.update(INDIVIDUAL_PROFILES)
            .set(INDIVIDUAL_PROFILES.DELETED_AT, LocalDateTime.now())
            .set(INDIVIDUAL_PROFILES.UPDATED_AT, LocalDateTime.now())
            .where(INDIVIDUAL_PROFILES.ID.eq(id))
            .awaitFirst()
    }

    override suspend fun findByUserIds(userIds: List<UUID>): List<IndividualProfile> {
        if (userIds.isEmpty()) return emptyList()

        return dsl.selectFrom(INDIVIDUAL_PROFILES)
            .where(INDIVIDUAL_PROFILES.USER_ID.`in`(userIds))
            .and(INDIVIDUAL_PROFILES.DELETED_AT.isNull)
            .awaitList()
            .map { mapRecordToIndividualProfile(it) }
    }

    override suspend fun getDistinctCountries(): List<String> {
        return dsl.selectDistinct(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY)
            .from(INDIVIDUAL_PROFILES)
            .where(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY.isNotNull)
            .and(INDIVIDUAL_PROFILES.DELETED_AT.isNull)
            .awaitList()
            .mapNotNull { it[INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY] }
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
        dsl.update(INDIVIDUAL_PROFILES)
            .apply {
                name?.let { set(INDIVIDUAL_PROFILES.NAME, it) }
                phone?.let { set(INDIVIDUAL_PROFILES.PHONE, it) }
                biography?.let { set(INDIVIDUAL_PROFILES.BIOGRAPHY, it) }
                nationality?.let { set(INDIVIDUAL_PROFILES.NATIONALITY, it) }
                countryOfResidence?.let { set(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY, it) }
            }
            .set(INDIVIDUAL_PROFILES.UPDATED_AT, LocalDateTime.now())
            .where(INDIVIDUAL_PROFILES.ID.eq(profileId))
            .awaitFirst()
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
} 