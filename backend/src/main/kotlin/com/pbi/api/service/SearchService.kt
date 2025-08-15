package com.pbi.api.service

import com.pbi.api.config.awaitList
import com.pbi.api.domain.UserType
import com.pbi.api.dto.SearchDTO
import com.pbi.api.dto.SearchResult
import com.pbi.api.repository.BusinessProfileRepository
import com.pbi.api.repository.CategoryRepository
import com.pbi.api.repository.IndividualProfileRepository
import com.pbi.api.repository.UserRepository
import com.pbi.generated.tables.references.*
import org.jooq.DSLContext
import org.jooq.impl.DSL
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class SearchService(
    private val userRepository: UserRepository,
    private val businessProfileRepository: BusinessProfileRepository,
    private val individualProfileRepository: IndividualProfileRepository,
    private val categoryRepository: CategoryRepository,
    private val dsl: DSLContext
) {

    suspend fun searchUsers(
        currentUserId: UUID?,
        q: String?,
        country: String?,
        categories: List<UUID>?,
        hasConnection: Boolean?,
        cursor: String?,
        size: Int,
        sort: SearchDTO.Input.ESortOrder
    ): SearchDTO.Output {
        // Parse cursor for pagination
        val cursorUserId = parseCursor(cursor)

        // Execute single JOOQ query with CTEs
        val searchResults =
            currentUserId?.let {
                executeSearchQuery(
                    currentUserId,
                    q,
                    country,
                    categories,
                    hasConnection,
                    cursorUserId,
                    size + 1,
                    sort
                )
            }
                ?: executeNonLoggedInSearchQuery(q, country, categories, cursorUserId, size + 1, sort)

        if (searchResults.isEmpty()) {
            return createEmptySearchResult(size, country)
        }

        // Check if there are more results by looking at the extra result we fetched
        val hasNext = searchResults.size > size
        val actualResults = if (hasNext) searchResults.take(size) else searchResults

        // Build response
        val userResults = buildUserResultsFromQuery(actualResults, currentUserId)
        val pagination = buildPaginationInfo(actualResults, cursor, sort, hasNext)
        val filters = buildFilterInfo(country)

        return SearchDTO.Output(
            users = userResults,
            pagination = pagination,
            filters = filters
        )
    }

    suspend fun searchBoostedUsers(
        currentUserId: UUID,
        q: String?,
        country: String?,
        categories: List<UUID>?,
        hasConnection: Boolean?,
        cursor: String?,
        size: Int
    ): SearchDTO.Output {
        val searchResults = executeBoostedSearchQuery(
            currentUserId,
            q,
            country,
            categories,
            hasConnection,
            parseCursor(cursor),
            size + 1
        )

        if (searchResults.isEmpty()) {
            return createEmptySearchResult(size, null)
        }

        val hasNext = searchResults.size > size
        val actualResults = if (hasNext) searchResults.take(size) else searchResults

        val userResults = buildUserResultsFromQuery(actualResults, currentUserId)
        val pagination = buildPaginationInfo(actualResults, cursor, SearchDTO.Input.ESortOrder.RECENT, hasNext)
        val filters = buildFilterInfo(null)

        return SearchDTO.Output(
            users = userResults,
            pagination = pagination,
            filters = filters
        )
    }

    private suspend fun executeSearchQuery(
        currentUserId: UUID,
        q: String?,
        country: String?,
        categories: List<UUID>?,
        hasConnection: Boolean?,
        cursorUserId: UUID?,
        size: Int,
        sort: SearchDTO.Input.ESortOrder
    ): List<SearchResult> {

        // CTE for current user's industries
        val currentUserIndustries = DSL.name("current_user_industries").`as`(
            dsl.select(USER_INDUSTRIES.CATEGORY_ID)
                .from(USER_INDUSTRIES)
                .where(USER_INDUSTRIES.USER_ID.eq(currentUserId))
                .and(USER_INDUSTRIES.DELETED_AT.isNull)
        )

        // CTE for current user's interests
        val currentUserInterests = DSL.name("current_user_interests").`as`(
            dsl.select(USER_INTERESTS.CATEGORY_ID)
                .from(USER_INTERESTS)
                .where(USER_INTERESTS.USER_ID.eq(currentUserId))
                .and(USER_INTERESTS.DELETED_AT.isNull)
        )

        // CTE for users whose interests match current user's industries
        val usersByInterests = DSL.name("users_by_interests").`as`(
            dsl.selectDistinct(USER_INTERESTS.USER_ID)
                .from(USER_INTERESTS)
                .innerJoin(currentUserIndustries)
                .on(USER_INTERESTS.CATEGORY_ID.eq(currentUserIndustries.field(USER_INDUSTRIES.CATEGORY_ID)))
                .where(USER_INTERESTS.DELETED_AT.isNull)
        )

        // CTE for users whose industries match current user's interests
        val usersByIndustries = DSL.name("users_by_industries").`as`(
            dsl.selectDistinct(USER_INDUSTRIES.USER_ID)
                .from(USER_INDUSTRIES)
                .innerJoin(currentUserInterests)
                .on(USER_INDUSTRIES.CATEGORY_ID.eq(currentUserInterests.field(USER_INTERESTS.CATEGORY_ID)))
                .where(USER_INDUSTRIES.DELETED_AT.isNull)
                .and(
                    if (categories.isNullOrEmpty()) DSL.trueCondition()
                    else USER_INDUSTRIES.CATEGORY_ID.`in`(categories)
                )
        )

        // CTE for bidirectional matching - only include users that appear in BOTH CTEs
        val matchingUsers = DSL.name("matching_users").`as`(
            dsl.select(usersByInterests.field(USER_INTERESTS.USER_ID))
                .from(usersByInterests)
                .innerJoin(usersByIndustries)
                .on(
                    usersByInterests.field(USER_INTERESTS.USER_ID)!!
                        .eq(usersByIndustries.field(USER_INDUSTRIES.USER_ID)!!)
                )
        )

        // Build the main query
        val industryCat = CATEGORIES.`as`("industry_cat")
        val interestCat = CATEGORIES.`as`("interest_cat")

        val theUser = USERS.`as`("the_user")

        var condition = theUser.ID.ne(currentUserId).and(theUser.DELETED_AT.isNull)
            .and(BUSINESS_PROFILES.DELETED_AT.isNull.or(INDIVIDUAL_PROFILES.DELETED_AT.isNull))
            .and(theUser.USER_TYPE.ne(UserType.ADMIN.name))
        // Apply country filter
        if (country.isNullOrBlank().not()) {
            condition = condition.and(
                BUSINESS_PROFILES.REGISTRATION_COUNTRY.eq(country)
                    .or(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY.eq(country))
            )
        }

        if (q.isNullOrBlank().not()) {
            condition = condition.and(
                BUSINESS_PROFILES.COMPANY_NAME.likeIgnoreCase("%$q%")
                    .or(INDIVIDUAL_PROFILES.NAME.likeIgnoreCase("%$q%"))
            )
        }

        // Apply cursor pagination
        if (cursorUserId != null) {
            condition = condition.and(theUser.ID.gt(cursorUserId))
        }

        // Apply connection filter if specified
        condition = when (hasConnection) {
            true -> condition.and(CONNECTION_REQUESTS.STATUS.`in`("PENDING", "ACCEPTED"))
            false -> condition.and(
                CONNECTION_REQUESTS.ID.isNull.or(
                    CONNECTION_REQUESTS.ID.isNull.or(
                        CONNECTION_REQUESTS.STATUS.`in`("CANCELLED", "REJECTED")
                    )
                )
            )

            else -> condition // No filter applied
        }

        val baseQuery =
            dsl.with(currentUserIndustries, currentUserInterests, usersByInterests, usersByIndustries, matchingUsers)
                .select(
                    theUser.ID,
                    theUser.EMAIL,
                    theUser.USER_TYPE,
                    theUser.ACTIVATED_AT,
                    BUSINESS_PROFILES.REGISTRATION_COUNTRY,
                    BUSINESS_PROFILES.COMPANY_NAME,
                    INDIVIDUAL_PROFILES.NAME,
                    INDIVIDUAL_PROFILES.NATIONALITY,
                    DSL.coalesce(INDIVIDUAL_PROFILES.BIOGRAPHY, BUSINESS_PROFILES.BIOGRAPHY).`as`("biography"),
                    DSL.coalesce(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY, BUSINESS_PROFILES.RESIDENCE_COUNTRY)
                        .`as`("residence_country"),
                    DSL.coalesce(INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL, BUSINESS_PROFILES.PROFILE_PICTURE_URL)
                        .`as`("profile_picture_url"),
                    DSL.coalesce(INDIVIDUAL_PROFILES.COVER_PICTURE_URL, BUSINESS_PROFILES.COVER_PICTURE_URL)
                        .`as`("cover_picture_url"),
                    DSL.arrayRemove(DSL.arrayAggDistinct(industryCat.NAME), DSL.`val`(null, String::class.java))
                        .`as`("industries"),
                    DSL.arrayRemove(DSL.arrayAggDistinct(interestCat.NAME), DSL.`val`(null, String::class.java))
                        .`as`("interests"),
                    CONNECTION_REQUESTS.STATUS.`as`("connection_status"),
                    CONNECTION_REQUESTS.SENDER_ID.`as`("connection_sender_id"),
                    CONNECTION_REQUESTS.ID.`as`("connection_request_id"),
                    CONNECTION_REQUESTS.REASON.`as`("connection_reason"),
                    CONNECTION_REQUESTS.MESSAGE.`as`("connection_message"),
                    CONNECTION_REQUESTS.CREATED_AT.`as`("connection_sent_at")
                )
                .from(theUser)
                .innerJoin(matchingUsers).on(theUser.ID.eq(matchingUsers.field(USER_INTERESTS.USER_ID)))
                .leftJoin(BUSINESS_PROFILES).on(BUSINESS_PROFILES.USER_ID.eq(theUser.ID))
                .leftJoin(INDIVIDUAL_PROFILES).on(INDIVIDUAL_PROFILES.USER_ID.eq(theUser.ID))
                .leftJoin(USER_INDUSTRIES).on(USER_INDUSTRIES.USER_ID.eq(theUser.ID))
                .leftJoin(industryCat).on(industryCat.ID.eq(USER_INDUSTRIES.CATEGORY_ID))
                .leftJoin(USER_INTERESTS).on(USER_INTERESTS.USER_ID.eq(theUser.ID))
                .leftJoin(interestCat).on(interestCat.ID.eq(USER_INTERESTS.CATEGORY_ID))
                .leftJoin(CONNECTION_REQUESTS).on(
                    CONNECTION_REQUESTS.SENDER_ID.eq(currentUserId).and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(theUser.ID))
                        .or(
                            CONNECTION_REQUESTS.SENDER_ID.eq(theUser.ID)
                                .and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(currentUserId))
                        )
                        .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
                )
                .where(condition)
                .groupBy(theUser.ID, BUSINESS_PROFILES.ID, INDIVIDUAL_PROFILES.ID, CONNECTION_REQUESTS.ID)
                .orderBy(theUser.ID.asc())
                .limit(size)

        // Execute query and map results
        return baseQuery.awaitList().map { record ->
            SearchResult(
                userId = record[theUser.ID]!!,
                email = record[theUser.EMAIL]!!,
                userType = record[theUser.USER_TYPE]?.let { UserType.valueOf(it) },
                activatedAt = record[theUser.ACTIVATED_AT],
                companyName = record[BUSINESS_PROFILES.COMPANY_NAME],
                businessBiography = record[BUSINESS_PROFILES.BIOGRAPHY],
                registrationCountry = record[BUSINESS_PROFILES.REGISTRATION_COUNTRY],
                businessResidenceCountry = record[BUSINESS_PROFILES.RESIDENCE_COUNTRY],
                businessProfilePictureUrl = record[BUSINESS_PROFILES.PROFILE_PICTURE_URL],
                businessCoverPictureUrl = record[BUSINESS_PROFILES.COVER_PICTURE_URL],
                personalName = record[INDIVIDUAL_PROFILES.NAME],
                individualBiography = record[INDIVIDUAL_PROFILES.BIOGRAPHY],
                nationality = record[INDIVIDUAL_PROFILES.NATIONALITY],
                individualResidenceCountry = record[INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY],
                individualProfilePictureUrl = record[INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL],
                individualCoverPictureUrl = record[INDIVIDUAL_PROFILES.COVER_PICTURE_URL],
                industries = record["industries", Array<String>::class.java]?.toSet() ?: emptySet(),
                interests = record["interests", Array<String>::class.java]?.toSet() ?: emptySet(),
                connectionStatus = record["connection_status", String::class.java],
                connectionSenderId = record["connection_sender_id", UUID::class.java],
                connectionRequestId = record["connection_request_id", UUID::class.java],
                connectionReason = record["connection_reason", String::class.java],
                connectionMessage = record["connection_message", String::class.java],
                connectionRequestSentAt = record["connection_sent_at", LocalDateTime::class.java]
            )
        }
    }

    private suspend fun executeBoostedSearchQuery(
        currentUserId: UUID,
        q: String?,
        country: String?,
        categories: List<UUID>?,
        hasConnection: Boolean?,
        cursorUserId: UUID?,
        size: Int
    ): List<SearchResult> {
        //TODO: ADD CACHING FOR USER INDUSTRIES

        // CTE for current user's industries
        val currentUserIndustries = DSL.name("current_user_industries").`as`(
            dsl.select(USER_INDUSTRIES.CATEGORY_ID)
                .from(USER_INDUSTRIES)
                .where(USER_INDUSTRIES.USER_ID.eq(currentUserId))
                .and(USER_INDUSTRIES.DELETED_AT.isNull)
        )

        val boostedUserIds = DSL.name("boosted_user_ids").`as`(
            dsl.selectDistinct(USER_INDUSTRIES.USER_ID)
                .from(USER_INDUSTRIES)
                .innerJoin(currentUserIndustries)
                .on(USER_INDUSTRIES.CATEGORY_ID.eq(currentUserIndustries.field(USER_INDUSTRIES.CATEGORY_ID)))
                .where(USER_INDUSTRIES.IS_BOOSTED.isTrue)
                .and(USER_INDUSTRIES.BOOST_EXPIRES_AT.gt(LocalDateTime.now()))
                .and(
                    if (categories.isNullOrEmpty()) DSL.trueCondition()
                    else USER_INDUSTRIES.CATEGORY_ID.`in`(categories)
                )
                .and(USER_INDUSTRIES.USER_ID.ne(currentUserId))
        )

        val industryCat = CATEGORIES.`as`("industry_cat")
        val interestCat = CATEGORIES.`as`("interest_cat")
        val theUser = USERS.`as`("the_user")

        var condition = theUser.ID.ne(currentUserId)
            .and(theUser.DELETED_AT.isNull)
            .and(BUSINESS_PROFILES.DELETED_AT.isNull.or(INDIVIDUAL_PROFILES.DELETED_AT.isNull))
            .and(theUser.USER_TYPE.ne(UserType.ADMIN.name))

        if (country.isNullOrBlank().not()) {
            condition = condition.and(
                BUSINESS_PROFILES.REGISTRATION_COUNTRY.eq(country)
                    .or(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY.eq(country))
            )
        }

        if (q.isNullOrBlank().not()) {
            condition = condition.and(
                BUSINESS_PROFILES.COMPANY_NAME.likeIgnoreCase("%$q%")
                    .or(INDIVIDUAL_PROFILES.NAME.likeIgnoreCase("%$q%"))
            )
        }

        if (cursorUserId != null) {
            condition = condition.and(theUser.ID.gt(cursorUserId))
        }

        // Apply connection filter if specified
        condition = when (hasConnection) {
            true -> condition.and(CONNECTION_REQUESTS.STATUS.`in`("PENDING", "ACCEPTED"))
            false -> condition.and(
                CONNECTION_REQUESTS.ID.isNull.or(
                    CONNECTION_REQUESTS.STATUS.`in`("CANCELLED", "REJECTED")
                )
            )

            else -> condition // No filter applied
        }

        val query = dsl.with(currentUserIndustries, boostedUserIds)
            .select(
                theUser.ID,
                theUser.EMAIL,
                theUser.USER_TYPE,
                theUser.ACTIVATED_AT,
                BUSINESS_PROFILES.REGISTRATION_COUNTRY,
                BUSINESS_PROFILES.COMPANY_NAME,
                INDIVIDUAL_PROFILES.NAME,
                INDIVIDUAL_PROFILES.NATIONALITY,
                DSL.coalesce(INDIVIDUAL_PROFILES.BIOGRAPHY, BUSINESS_PROFILES.BIOGRAPHY).`as`("biography"),
                DSL.coalesce(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY, BUSINESS_PROFILES.RESIDENCE_COUNTRY)
                    .`as`("residence_country"),
                DSL.coalesce(INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL, BUSINESS_PROFILES.PROFILE_PICTURE_URL)
                    .`as`("profile_picture_url"),
                DSL.coalesce(INDIVIDUAL_PROFILES.COVER_PICTURE_URL, BUSINESS_PROFILES.COVER_PICTURE_URL)
                    .`as`("cover_picture_url"),
                DSL.arrayRemove(DSL.arrayAggDistinct(industryCat.NAME), DSL.`val`(null, String::class.java)),
                DSL.arrayRemove(DSL.arrayAggDistinct(industryCat.NAME), DSL.`val`(null, String::class.java))
                    .`as`("industries"),
                DSL.arrayRemove(DSL.arrayAggDistinct(interestCat.NAME), DSL.`val`(null, String::class.java))
                    .`as`("interests"),
                CONNECTION_REQUESTS.STATUS.`as`("connection_status"),
                CONNECTION_REQUESTS.SENDER_ID.`as`("connection_sender_id"),
                CONNECTION_REQUESTS.ID.`as`("connection_request_id"),
                CONNECTION_REQUESTS.REASON.`as`("connection_reason"),
                CONNECTION_REQUESTS.MESSAGE.`as`("connection_message"),
                CONNECTION_REQUESTS.CREATED_AT.`as`("connection_sent_at")
            )
            .from(theUser)
            .innerJoin(boostedUserIds).on(theUser.ID.eq(boostedUserIds.field(USER_INDUSTRIES.USER_ID)))
            .leftJoin(BUSINESS_PROFILES).on(BUSINESS_PROFILES.USER_ID.eq(theUser.ID))
            .leftJoin(INDIVIDUAL_PROFILES).on(INDIVIDUAL_PROFILES.USER_ID.eq(theUser.ID))
            .leftJoin(USER_INDUSTRIES).on(USER_INDUSTRIES.USER_ID.eq(theUser.ID))
            .leftJoin(industryCat).on(industryCat.ID.eq(USER_INDUSTRIES.CATEGORY_ID))
            .leftJoin(USER_INTERESTS).on(USER_INTERESTS.USER_ID.eq(theUser.ID))
            .leftJoin(interestCat).on(interestCat.ID.eq(USER_INTERESTS.CATEGORY_ID))
            .leftJoin(CONNECTION_REQUESTS).on(
                CONNECTION_REQUESTS.SENDER_ID.eq(currentUserId).and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(theUser.ID))
                    .or(
                        CONNECTION_REQUESTS.SENDER_ID.eq(theUser.ID)
                            .and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(currentUserId))
                    )
                    .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            )
            .where(condition)
            .groupBy(theUser.ID, BUSINESS_PROFILES.ID, INDIVIDUAL_PROFILES.ID, CONNECTION_REQUESTS.ID)
            .orderBy(theUser.ID.asc())
            .limit(size)

        return query.awaitList().map { record ->
            SearchResult(
                userId = record[theUser.ID]!!,
                email = record[theUser.EMAIL]!!,
                userType = record[theUser.USER_TYPE]?.let { UserType.valueOf(it) },
                activatedAt = record[theUser.ACTIVATED_AT],
                companyName = record[BUSINESS_PROFILES.COMPANY_NAME],
                businessBiography = record[BUSINESS_PROFILES.BIOGRAPHY],
                registrationCountry = record[BUSINESS_PROFILES.REGISTRATION_COUNTRY],
                businessResidenceCountry = record[BUSINESS_PROFILES.RESIDENCE_COUNTRY],
                businessProfilePictureUrl = record[BUSINESS_PROFILES.PROFILE_PICTURE_URL],
                businessCoverPictureUrl = record[BUSINESS_PROFILES.COVER_PICTURE_URL],
                personalName = record[INDIVIDUAL_PROFILES.NAME],
                individualBiography = record[INDIVIDUAL_PROFILES.BIOGRAPHY],
                nationality = record[INDIVIDUAL_PROFILES.NATIONALITY],
                individualResidenceCountry = record[INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY],
                individualProfilePictureUrl = record[INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL],
                individualCoverPictureUrl = record[INDIVIDUAL_PROFILES.COVER_PICTURE_URL],
                industries = record["industries", Array<String>::class.java]?.toSet() ?: emptySet(),
                interests = record["interests", Array<String>::class.java]?.toSet() ?: emptySet(),
                connectionStatus = record["connection_status", String::class.java],
                connectionSenderId = record["connection_sender_id", UUID::class.java],
                connectionRequestId = record["connection_request_id", UUID::class.java],
                connectionReason = record["connection_reason", String::class.java],
                connectionMessage = record["connection_message", String::class.java],
                connectionRequestSentAt = record["connection_sent_at", LocalDateTime::class.java]
            )
        }
    }

    private suspend fun executeNonLoggedInSearchQuery(
        q: String?,
        country: String?,
        categories: List<UUID>?,
        cursorUserId: UUID?,
        size: Int,
        sort: SearchDTO.Input.ESortOrder
    ): List<SearchResult> {

        // Build the main query
        val industryCat = CATEGORIES.`as`("industry_cat")
        val interestCat = CATEGORIES.`as`("interest_cat")

        val theUser = USERS.`as`("the_user")

        var condition =
            theUser.DELETED_AT.isNull
                .and(BUSINESS_PROFILES.DELETED_AT.isNull.or(INDIVIDUAL_PROFILES.DELETED_AT.isNull))
                .and(theUser.USER_TYPE.ne(UserType.ADMIN.name))
        // Apply country filter
        if (country.isNullOrBlank().not()) {
            condition = condition.and(
                BUSINESS_PROFILES.REGISTRATION_COUNTRY.eq(country)
                    .or(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY.eq(country))
            )
        }

        if (q.isNullOrBlank().not()) {
            condition = condition.and(
                BUSINESS_PROFILES.COMPANY_NAME.likeIgnoreCase("%$q%")
                    .or(INDIVIDUAL_PROFILES.NAME.likeIgnoreCase("%$q%"))
            )
        }

        // Apply cursor pagination
        if (cursorUserId != null) {
            condition = condition.and(theUser.ID.gt(cursorUserId))
        }

        // If categories are provided, filter by industries and interests
        if (categories.isNullOrEmpty().not()) {
            condition = condition.and(
                USER_INDUSTRIES.CATEGORY_ID.`in`(categories)
                    .or(USER_INTERESTS.CATEGORY_ID.`in`(categories))
            )
        }

        val query =
            dsl.select(
                theUser.ID,
                theUser.EMAIL,
                theUser.USER_TYPE,
                theUser.ACTIVATED_AT,
                BUSINESS_PROFILES.REGISTRATION_COUNTRY,
                BUSINESS_PROFILES.COMPANY_NAME,
                INDIVIDUAL_PROFILES.NAME,
                INDIVIDUAL_PROFILES.NATIONALITY,
                DSL.coalesce(INDIVIDUAL_PROFILES.BIOGRAPHY, BUSINESS_PROFILES.BIOGRAPHY).`as`("biography"),
                DSL.coalesce(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY, BUSINESS_PROFILES.RESIDENCE_COUNTRY)
                    .`as`("residence_country"),
                DSL.coalesce(INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL, BUSINESS_PROFILES.PROFILE_PICTURE_URL)
                    .`as`("profile_picture_url"),
                DSL.coalesce(INDIVIDUAL_PROFILES.COVER_PICTURE_URL, BUSINESS_PROFILES.COVER_PICTURE_URL)
                    .`as`("cover_picture_url"),
                DSL.arrayRemove(DSL.arrayAggDistinct(industryCat.NAME), DSL.`val`(null, String::class.java)),
                DSL.arrayRemove(DSL.arrayAggDistinct(industryCat.NAME), DSL.`val`(null, String::class.java))
                    .`as`("industries"),
                DSL.arrayRemove(DSL.arrayAggDistinct(interestCat.NAME), DSL.`val`(null, String::class.java))
                    .`as`("interests"),
            )
                .from(theUser)
                .leftJoin(BUSINESS_PROFILES).on(BUSINESS_PROFILES.USER_ID.eq(theUser.ID))
                .leftJoin(INDIVIDUAL_PROFILES).on(INDIVIDUAL_PROFILES.USER_ID.eq(theUser.ID))
                .leftJoin(USER_INDUSTRIES).on(USER_INDUSTRIES.USER_ID.eq(theUser.ID))
                .leftJoin(industryCat).on(industryCat.ID.eq(USER_INDUSTRIES.CATEGORY_ID))
                .leftJoin(USER_INTERESTS).on(USER_INTERESTS.USER_ID.eq(theUser.ID))
                .leftJoin(interestCat).on(interestCat.ID.eq(USER_INTERESTS.CATEGORY_ID))
                .where(condition)
                .groupBy(theUser.ID, BUSINESS_PROFILES.ID, INDIVIDUAL_PROFILES.ID)
                .orderBy(theUser.ID.asc())
                .limit(size)

        // Execute query and map results
        return query.awaitList().map { record ->
            SearchResult(
                userId = record[theUser.ID]!!,
                email = record[theUser.EMAIL]!!,
                userType = record[theUser.USER_TYPE]?.let { UserType.valueOf(it) },
                activatedAt = record[theUser.ACTIVATED_AT],
                companyName = record[BUSINESS_PROFILES.COMPANY_NAME],
                businessBiography = record[BUSINESS_PROFILES.BIOGRAPHY],
                registrationCountry = record[BUSINESS_PROFILES.REGISTRATION_COUNTRY],
                businessResidenceCountry = record[BUSINESS_PROFILES.RESIDENCE_COUNTRY],
                businessProfilePictureUrl = record[BUSINESS_PROFILES.PROFILE_PICTURE_URL],
                businessCoverPictureUrl = record[BUSINESS_PROFILES.COVER_PICTURE_URL],
                personalName = record[INDIVIDUAL_PROFILES.NAME],
                individualBiography = record[INDIVIDUAL_PROFILES.BIOGRAPHY],
                nationality = record[INDIVIDUAL_PROFILES.NATIONALITY],
                individualResidenceCountry = record[INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY],
                individualProfilePictureUrl = record[INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL],
                individualCoverPictureUrl = record[INDIVIDUAL_PROFILES.COVER_PICTURE_URL],
                industries = record["industries", Array<String>::class.java]?.toSet() ?: emptySet(),
                interests = record["interests", Array<String>::class.java]?.toSet() ?: emptySet(),
                connectionStatus = null,
                connectionSenderId = null,
                connectionRequestId = null,
                connectionReason = null,
                connectionMessage = null,
                connectionRequestSentAt = null
            )
        }
    }


    internal suspend fun buildUserResultsFromQuery(
        searchResults: List<SearchResult>,
        currentUserId: UUID?
    ): List<SearchDTO.Output.UserResult> {
        return searchResults.map { result ->
            SearchDTO.Output.UserResult(
                id = result.userId.toString(),
                userType = when (result.userType) {
                    UserType.BUSINESS -> SearchDTO.Output.UserResult.EUserType.BUSINESS
                    UserType.INDIVIDUAL -> SearchDTO.Output.UserResult.EUserType.INDIVIDUAL
                    else -> SearchDTO.Output.UserResult.EUserType.INDIVIDUAL
                },
                profile = if (!result.companyName.isNullOrBlank() || !result.personalName.isNullOrBlank()) {
                    SearchDTO.Output.UserResult.ProfileInfo(
                        companyName = result.companyName,
                        personalName = result.personalName,
                        biography = result.businessBiography ?: result.individualBiography,
                        registrationCountry = result.registrationCountry,
                        residenceCountry = result.businessResidenceCountry ?: result.individualResidenceCountry,
                        profilePictureUrl = result.businessProfilePictureUrl ?: result.individualProfilePictureUrl,
                        coverPictureUrl = result.businessCoverPictureUrl ?: result.individualCoverPictureUrl
                    )
                } else null,
                industries = result.industries,
                interests = result.interests,
                connectionStatus = determineConnectionStatus(result, currentUserId),
                connectionRequestId = result.connectionRequestId?.toString(),
                connectionReason = result.connectionReason,
                connectionMessage = result.connectionMessage,
                connectionRequestSentAt = result.connectionRequestSentAt?.format(
                    DateTimeFormatter.ofPattern("MMM d, yyyy")
                )
            )
        }
    }

    private fun determineConnectionStatus(
        result: SearchResult,
        currentUserId: UUID?
    ): SearchDTO.Output.UserResult.ConnectionStatus? {
        // If no connection request exists, return null (which means NONE status for logged-in users)
        if (result.connectionStatus == null) {
            return null
        }

        return when (result.connectionStatus) {
            "PENDING" -> {
                // For pending requests, check who sent it to determine the correct status
                if (currentUserId != null && result.connectionSenderId == currentUserId) {
                    SearchDTO.Output.UserResult.ConnectionStatus.REQUEST_SENT
                } else {
                    SearchDTO.Output.UserResult.ConnectionStatus.REQUEST_RECEIVED
                }
            }

            "ACCEPTED" -> SearchDTO.Output.UserResult.ConnectionStatus.CONNECTED
            "REJECTED" -> SearchDTO.Output.UserResult.ConnectionStatus.REQUEST_REJECTED
            "CANCELLED" -> SearchDTO.Output.UserResult.ConnectionStatus.REQUEST_CANCELLED
            else -> null
        }
    }

    internal suspend fun buildPaginationInfo(
        searchResults: List<SearchResult>,
        cursor: String?,
        sort: SearchDTO.Input.ESortOrder,
        hasNext: Boolean
    ): SearchDTO.Output.PaginationInfo {
        val nextCursor = if (hasNext && searchResults.isNotEmpty()) {
            val lastResult = searchResults.last()
            createCursor(lastResult.userId, sort)
        } else null

        return SearchDTO.Output.PaginationInfo(
            cursor = cursor,
            nextCursor = nextCursor,
            hasNext = hasNext,
            size = searchResults.size
        )
    }

    internal suspend fun buildFilterInfo(country: String?): SearchDTO.Output.FilterInfo {
//        val availableCountries = getAvailableCountries()

        return SearchDTO.Output.FilterInfo(
            applied = SearchDTO.Output.FilterInfo.AppliedFilters(
                country = country,
                userType = null
            ),
            available = SearchDTO.Output.FilterInfo.AvailableFilters(
                countries = listOf()/*availableCountries*/,
                userTypes = listOf("BUSINESS", "INDIVIDUAL")
            )
        )
    }

    internal fun createEmptySearchResult(size: Int, country: String?): SearchDTO.Output {
        return SearchDTO.Output(
            users = emptyList(),
            pagination = SearchDTO.Output.PaginationInfo(
                cursor = null,
                nextCursor = null,
                hasNext = false,
                size = 0
            ),
            filters = SearchDTO.Output.FilterInfo(
                applied = SearchDTO.Output.FilterInfo.AppliedFilters(country, null),
                available = SearchDTO.Output.FilterInfo.AvailableFilters(
                    countries = emptyList(),
                    userTypes = listOf("BUSINESS", "INDIVIDUAL")
                )
            )
        )
    }

    internal fun parseCursor(cursor: String?): UUID? {
        if (cursor.isNullOrBlank()) return null

        return try {
            UUID.fromString(cursor)
        } catch (e: Exception) {
            null
        }
    }

    private fun createCursor(userId: UUID, sort: SearchDTO.Input.ESortOrder): String {
        return userId.toString()
    }
}
