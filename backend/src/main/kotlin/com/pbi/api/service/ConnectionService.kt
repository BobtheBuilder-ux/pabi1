package com.pbi.api.service

import com.pbi.api.config.awaitList
import com.pbi.api.dto.ConnectionDTO
import com.pbi.api.exception.ResourceNotFoundException
import com.pbi.api.exception.ValidationException
import com.pbi.generated.tables.references.BUSINESS_PROFILES
import com.pbi.generated.tables.references.CONNECTION_REQUESTS
import com.pbi.generated.tables.references.INDIVIDUAL_PROFILES
import com.pbi.generated.tables.references.USERS
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.jooq.DSLContext
import org.jooq.Record
import org.jooq.impl.DSL
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class ConnectionService(
    private val dsl: DSLContext
) {

    @Transactional
    suspend fun sendConnectionRequest(
        senderId: UUID,
        request: ConnectionDTO.SendRequestInput
    ): ConnectionDTO.ConnectionRequestOutput {
        val recipientId = try {
            UUID.fromString(request.recipientId)
        } catch (e: IllegalArgumentException) {
            throw ValidationException("Invalid recipient ID format")
        }

        // Check if recipient exists and is not the sender
        if (senderId == recipientId) {
            throw ValidationException("Cannot send connection request to yourself")
        }

        val recipientExists = dsl.select(USERS.ID)
            .from(USERS)
            .where(
                USERS.ID.eq(recipientId)
                    .and(USERS.ACTIVATED_AT.isNotNull)
                    .and(USERS.DELETED_AT.isNull)
            )
            .limit(1)
            .awaitList().isNotEmpty()


        if (!recipientExists) {
            throw ResourceNotFoundException("Recipient not found")
        }

        // Check if connection request already exists
        val existingRequest = dsl.selectFrom(CONNECTION_REQUESTS)
            .where(
                CONNECTION_REQUESTS.SENDER_ID.eq(senderId)
                    .and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(recipientId))
                    .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            )
            .limit(1)
            .awaitList().firstOrNull()


        if (existingRequest != null) {
            when (existingRequest.status) {
                "PENDING" -> throw ValidationException("Connection request already sent")
                "ACCEPTED" -> throw ValidationException("Already connected to this user")
                "REJECTED" -> {
                    // Allow sending a new request after rejection
                    dsl.update(CONNECTION_REQUESTS)
                        .set(CONNECTION_REQUESTS.STATUS, "PENDING")
                        .set(CONNECTION_REQUESTS.UPDATED_AT, LocalDateTime.now())
                        .where(CONNECTION_REQUESTS.ID.eq(existingRequest.id))
                        .awaitFirst()

                    return getConnectionRequestById(existingRequest.id!!)
                }

                "CANCELLED" -> {
                    // Allow sending a new request after cancellation
                    dsl.update(CONNECTION_REQUESTS)
                        .set(CONNECTION_REQUESTS.STATUS, "PENDING")
                        .set(CONNECTION_REQUESTS.UPDATED_AT, LocalDateTime.now())
                        .where(CONNECTION_REQUESTS.ID.eq(existingRequest.id))
                        .awaitFirst()

                    return getConnectionRequestById(existingRequest.id!!)
                }
            }
        }

        // Create new connection request
        val requestId = dsl.insertInto(CONNECTION_REQUESTS)
            .set(CONNECTION_REQUESTS.SENDER_ID, senderId)
            .set(CONNECTION_REQUESTS.RECIPIENT_ID, recipientId)
            .set(CONNECTION_REQUESTS.MESSAGE, request.message)
            .set(CONNECTION_REQUESTS.REASON, request.reason)
            .set(CONNECTION_REQUESTS.STATUS, "PENDING")
            .returningResult(CONNECTION_REQUESTS.ID)
            .awaitFirst()
            .get(CONNECTION_REQUESTS.ID)

        return getConnectionRequestById(requestId!!)
    }

    suspend fun getReceivedRequests(
        userId: UUID,
        input: ConnectionDTO.ConnectionListInput
    ): ConnectionDTO.ConnectionListOutput {
        val cursorId = input.cursor?.let {
            try {
                UUID.fromString(it)
            } catch (e: Exception) {
                null
            }
        }

        var condition = CONNECTION_REQUESTS.RECIPIENT_ID.eq(userId)
            .and(CONNECTION_REQUESTS.DELETED_AT.isNull)

        input.status?.let { status ->
            condition = condition.and(CONNECTION_REQUESTS.STATUS.eq(status.name))
        }

        if (cursorId != null) {
            condition = condition.and(CONNECTION_REQUESTS.ID.gt(cursorId))
        }

        val sender = USERS.`as`("sender")
        val recipient = USERS.`as`("recipient")
        val senderBusinessProfile = BUSINESS_PROFILES.`as`("sender_bp")
        val senderIndividualProfile = INDIVIDUAL_PROFILES.`as`("sender_ip")
        val recipientBusinessProfile = BUSINESS_PROFILES.`as`("recipient_bp")
        val recipientIndividualProfile = INDIVIDUAL_PROFILES.`as`("recipient_ip")
        val records = dsl.select(
            CONNECTION_REQUESTS.ID,
            CONNECTION_REQUESTS.SENDER_ID,
            CONNECTION_REQUESTS.RECIPIENT_ID,
            CONNECTION_REQUESTS.STATUS,
            CONNECTION_REQUESTS.MESSAGE,
            CONNECTION_REQUESTS.REASON,
            CONNECTION_REQUESTS.CREATED_AT,
            CONNECTION_REQUESTS.UPDATED_AT,
            sender.EMAIL,
            sender.USER_TYPE,
            recipient.EMAIL,
            recipient.USER_TYPE,
            senderBusinessProfile.COMPANY_NAME,
            senderBusinessProfile.COMPANY_EMAIL,
            senderBusinessProfile.BIOGRAPHY,
            senderBusinessProfile.REGISTRATION_COUNTRY,
            senderBusinessProfile.PROFILE_PICTURE_URL,
            senderIndividualProfile.NAME,
            senderIndividualProfile.BIOGRAPHY,
            senderIndividualProfile.RESIDENCE_COUNTRY,
            senderIndividualProfile.PROFILE_PICTURE_URL,
            recipientBusinessProfile.COMPANY_NAME,
            recipientBusinessProfile.COMPANY_EMAIL,
            recipientBusinessProfile.BIOGRAPHY,
            recipientBusinessProfile.REGISTRATION_COUNTRY,
            recipientBusinessProfile.PROFILE_PICTURE_URL,
            recipientIndividualProfile.NAME,
            recipientIndividualProfile.BIOGRAPHY,
            recipientIndividualProfile.RESIDENCE_COUNTRY,
            recipientIndividualProfile.PROFILE_PICTURE_URL
        )
            .from(CONNECTION_REQUESTS)
            .join(sender).on(CONNECTION_REQUESTS.SENDER_ID.eq(sender.ID))
            .join(recipient).on(CONNECTION_REQUESTS.RECIPIENT_ID.eq(recipient.ID))
            .leftJoin(senderBusinessProfile)
            .on(sender.ID.eq(senderBusinessProfile.USER_ID))
            .leftJoin(senderIndividualProfile)
            .on(sender.ID.eq(senderIndividualProfile.USER_ID))
            .leftJoin(recipientBusinessProfile)
            .on(recipient.ID.eq(recipientBusinessProfile.USER_ID))
            .leftJoin(recipientIndividualProfile)
            .on(recipient.ID.eq(recipientIndividualProfile.USER_ID))
            .where(condition)
            .orderBy(CONNECTION_REQUESTS.ID.asc())
            .limit(input.size + 1)
            .awaitList()

        val requests = records.take(input.size).map { record ->
            mapRecordToConnectionRequest(record)
        }

        val hasNext = records.size > input.size
        val nextCursor = if (hasNext && requests.isNotEmpty()) {
            requests.last().id
        } else null

        return ConnectionDTO.ConnectionListOutput(
            requests = requests,
            pagination = ConnectionDTO.PaginationInfo(
                cursor = input.cursor,
                nextCursor = nextCursor,
                hasNext = hasNext,
                size = input.size
            )
        )
    }

    suspend fun getSentRequests(
        userId: UUID,
        input: ConnectionDTO.ConnectionListInput
    ): ConnectionDTO.ConnectionListOutput {
        val cursorId = input.cursor?.let {
            try {
                UUID.fromString(it)
            } catch (e: Exception) {
                null
            }
        }

        var condition = CONNECTION_REQUESTS.SENDER_ID.eq(userId)
            .and(CONNECTION_REQUESTS.DELETED_AT.isNull)

        input.status?.let { status ->
            condition = condition.and(CONNECTION_REQUESTS.STATUS.eq(status.name))
        }

        if (cursorId != null) {
            condition = condition.and(CONNECTION_REQUESTS.ID.gt(cursorId))
        }

        val sender = USERS.`as`("sender")
        val recipient = USERS.`as`("recipient")
        val senderBusinessProfile = BUSINESS_PROFILES.`as`("sender_bp")
        val senderIndividualProfile = INDIVIDUAL_PROFILES.`as`("sender_ip")
        val recipientBusinessProfile = BUSINESS_PROFILES.`as`("recipient_bp")
        val recipientIndividualProfile = INDIVIDUAL_PROFILES.`as`("recipient_ip")
        val records = dsl.select(
            CONNECTION_REQUESTS.ID,
            CONNECTION_REQUESTS.SENDER_ID,
            CONNECTION_REQUESTS.RECIPIENT_ID,
            CONNECTION_REQUESTS.STATUS,
            CONNECTION_REQUESTS.MESSAGE,
            CONNECTION_REQUESTS.REASON,
            CONNECTION_REQUESTS.CREATED_AT,
            CONNECTION_REQUESTS.UPDATED_AT,
            sender.EMAIL,
            sender.USER_TYPE,
            recipient.EMAIL,
            recipient.USER_TYPE,
            senderBusinessProfile.COMPANY_NAME,
            senderBusinessProfile.COMPANY_EMAIL,
            senderBusinessProfile.BIOGRAPHY,
            senderBusinessProfile.REGISTRATION_COUNTRY,
            senderBusinessProfile.PROFILE_PICTURE_URL,
            senderIndividualProfile.NAME,
            senderIndividualProfile.BIOGRAPHY,
            senderIndividualProfile.RESIDENCE_COUNTRY,
            senderIndividualProfile.PROFILE_PICTURE_URL,
            recipientBusinessProfile.COMPANY_NAME,
            recipientBusinessProfile.COMPANY_EMAIL,
            recipientBusinessProfile.BIOGRAPHY,
            recipientBusinessProfile.REGISTRATION_COUNTRY,
            recipientBusinessProfile.PROFILE_PICTURE_URL,
            recipientIndividualProfile.NAME,
            recipientIndividualProfile.BIOGRAPHY,
            recipientIndividualProfile.RESIDENCE_COUNTRY,
            recipientIndividualProfile.PROFILE_PICTURE_URL
        )
            .from(CONNECTION_REQUESTS)
            .join(sender).on(CONNECTION_REQUESTS.SENDER_ID.eq(sender.ID))
            .join(recipient).on(CONNECTION_REQUESTS.RECIPIENT_ID.eq(recipient.ID))
            .leftJoin(senderBusinessProfile)
            .on(sender.ID.eq(senderBusinessProfile.USER_ID))
            .leftJoin(senderIndividualProfile)
            .on(sender.ID.eq(senderIndividualProfile.USER_ID))
            .leftJoin(recipientBusinessProfile)
            .on(recipient.ID.eq(recipientBusinessProfile.USER_ID))
            .leftJoin(recipientIndividualProfile)
            .on(recipient.ID.eq(recipientIndividualProfile.USER_ID))
            .where(condition)
            .orderBy(CONNECTION_REQUESTS.ID.asc())
            .limit(input.size + 1)
            .awaitList()

        val requests = records.take(input.size).map { record ->
            mapRecordToConnectionRequest(record)
        }

        val hasNext = records.size > input.size
        val nextCursor = if (hasNext && requests.isNotEmpty()) {
            requests.last().id
        } else null

        return ConnectionDTO.ConnectionListOutput(
            requests = requests,
            pagination = ConnectionDTO.PaginationInfo(
                cursor = input.cursor,
                nextCursor = nextCursor,
                hasNext = hasNext,
                size = input.size
            )
        )
    }

    @Transactional
    suspend fun acceptConnectionRequest(
        userId: UUID,
        requestId: UUID
    ): ConnectionDTO.ConnectionRequestOutput {
        val updated = dsl.update(CONNECTION_REQUESTS)
            .set(CONNECTION_REQUESTS.STATUS, "ACCEPTED")
            .set(CONNECTION_REQUESTS.UPDATED_AT, LocalDateTime.now())
            .where(CONNECTION_REQUESTS.ID.eq(requestId))
            .and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(userId))
            .and(CONNECTION_REQUESTS.STATUS.eq("PENDING"))
            .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            .awaitFirst()

        if (updated == 0) {
            throw ResourceNotFoundException("Connection request not found or cannot be accepted")
        }

        return getConnectionRequestById(requestId)
    }

    @Transactional
    suspend fun rejectConnectionRequest(
        userId: UUID,
        requestId: UUID
    ): ConnectionDTO.ConnectionRequestOutput {
        val updated = dsl.update(CONNECTION_REQUESTS)
            .set(CONNECTION_REQUESTS.STATUS, "REJECTED")
            .set(CONNECTION_REQUESTS.UPDATED_AT, LocalDateTime.now())
            .where(CONNECTION_REQUESTS.ID.eq(requestId))
            .and(CONNECTION_REQUESTS.RECIPIENT_ID.eq(userId))
            .and(CONNECTION_REQUESTS.STATUS.eq("PENDING"))
            .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            .awaitFirst()

        if (updated == 0) {
            throw ResourceNotFoundException("Connection request not found or cannot be rejected")
        }

        return getConnectionRequestById(requestId)
    }

    @Transactional
    suspend fun cancelConnectionRequest(
        userId: UUID,
        requestId: UUID
    ): ConnectionDTO.ConnectionRequestOutput {
        val updated = dsl.update(CONNECTION_REQUESTS)
            .set(CONNECTION_REQUESTS.STATUS, "CANCELLED")
            .set(CONNECTION_REQUESTS.UPDATED_AT, LocalDateTime.now())
            .where(CONNECTION_REQUESTS.ID.eq(requestId))
            .and(CONNECTION_REQUESTS.SENDER_ID.eq(userId))
            .and(CONNECTION_REQUESTS.STATUS.eq("PENDING"))
            .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            .awaitFirst()

        if (updated == 0) {
            throw ResourceNotFoundException("Connection request not found or cannot be cancelled")
        }

        return getConnectionRequestById(requestId)
    }

    suspend fun getConnections(
        userId: UUID,
        input: ConnectionDTO.ConnectionListInput
    ): ConnectionDTO.ConnectionOutput {
        val cursorId = input.cursor?.let {
            try {
                UUID.fromString(it)
            } catch (e: Exception) {
                null
            }
        }

        // Get accepted connections where user is either sender or recipient
        var condition = CONNECTION_REQUESTS.STATUS.eq("ACCEPTED")
            .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            .and(
                CONNECTION_REQUESTS.SENDER_ID.eq(userId)
                    .or(CONNECTION_REQUESTS.RECIPIENT_ID.eq(userId))
            )

        if (cursorId != null) {
            condition = condition.and(CONNECTION_REQUESTS.ID.gt(cursorId))
        }

        val records = dsl.select(
            CONNECTION_REQUESTS.ID,
            CONNECTION_REQUESTS.SENDER_ID,
            CONNECTION_REQUESTS.RECIPIENT_ID,
            USERS.`as`("other_user").ID,
            USERS.`as`("other_user").EMAIL,
            USERS.`as`("other_user").USER_TYPE,
            BUSINESS_PROFILES.COMPANY_NAME,
            BUSINESS_PROFILES.COMPANY_EMAIL,
            BUSINESS_PROFILES.BIOGRAPHY,
            BUSINESS_PROFILES.REGISTRATION_COUNTRY,
            BUSINESS_PROFILES.PROFILE_PICTURE_URL,
            INDIVIDUAL_PROFILES.NAME,
            INDIVIDUAL_PROFILES.BIOGRAPHY,
            INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY,
            INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL
        )
            .from(CONNECTION_REQUESTS)
            .join(USERS.`as`("other_user")).on(
                DSL.case_()
                    .`when`(CONNECTION_REQUESTS.SENDER_ID.eq(userId), CONNECTION_REQUESTS.RECIPIENT_ID)
                    .otherwise(CONNECTION_REQUESTS.SENDER_ID)
                    .eq(USERS.`as`("other_user").ID)
            )
            .leftJoin(BUSINESS_PROFILES).on(USERS.`as`("other_user").ID.eq(BUSINESS_PROFILES.USER_ID))
            .leftJoin(INDIVIDUAL_PROFILES).on(USERS.`as`("other_user").ID.eq(INDIVIDUAL_PROFILES.USER_ID))
            .where(condition)
            .orderBy(CONNECTION_REQUESTS.ID.asc())
            .limit(input.size + 1)
            .awaitList()

        val connections = records.take(input.size).map { record ->
            val userType = record.get(USERS.`as`("other_user").USER_TYPE)!!
            val isBusinessUser = userType == "BUSINESS"

            ConnectionDTO.UserInfo(
                id = record.get(USERS.`as`("other_user").ID).toString(),
                userType = if (isBusinessUser) ConnectionDTO.UserInfo.UserType.BUSINESS
                else ConnectionDTO.UserInfo.UserType.INDIVIDUAL,
                profile = ConnectionDTO.ProfileInfo(
                    name = if (isBusinessUser)
                        record.get(BUSINESS_PROFILES.COMPANY_NAME) ?: "Unknown Company"
                    else record.get(INDIVIDUAL_PROFILES.NAME) ?: "Unknown User",
                    email = if (isBusinessUser)
                        record.get(BUSINESS_PROFILES.COMPANY_EMAIL)
                    else record.get(USERS.`as`("other_user").EMAIL),
                    biography = record.get(if (isBusinessUser) BUSINESS_PROFILES.BIOGRAPHY else INDIVIDUAL_PROFILES.BIOGRAPHY),
                    country = if (isBusinessUser)
                        record.get(BUSINESS_PROFILES.REGISTRATION_COUNTRY)
                    else record.get(INDIVIDUAL_PROFILES.RESIDENCE_COUNTRY),
                    profilePictureUrl = record.get(if (isBusinessUser) BUSINESS_PROFILES.PROFILE_PICTURE_URL else INDIVIDUAL_PROFILES.PROFILE_PICTURE_URL)
                )
            )
        }

        val hasNext = records.size > input.size
        val nextCursor = if (hasNext && connections.isNotEmpty()) {
            records[input.size - 1].get(CONNECTION_REQUESTS.ID).toString()
        } else null

        return ConnectionDTO.ConnectionOutput(
            connections = connections,
            pagination = ConnectionDTO.PaginationInfo(
                cursor = input.cursor,
                nextCursor = nextCursor,
                hasNext = hasNext,
                size = input.size
            )
        )
    }

    @Transactional
    suspend fun removeConnection(
        userId: UUID,
        connectionId: UUID
    ) {

        // Soft delete the connection
        val updated = dsl.update(CONNECTION_REQUESTS)
            .set(CONNECTION_REQUESTS.DELETED_AT, LocalDateTime.now())
            .set(CONNECTION_REQUESTS.UPDATED_AT, LocalDateTime.now())
            .where(CONNECTION_REQUESTS.ID.eq(connectionId))
            .awaitFirst()

        if (updated == 0) {
            throw ResourceNotFoundException("Connection not found")
        }
    }

    suspend fun getConnectionStats(userId: UUID): ConnectionDTO.ConnectionStatsOutput {
        val totalConnections = dsl.selectCount()
            .from(CONNECTION_REQUESTS)
            .where(
                CONNECTION_REQUESTS.STATUS.eq("ACCEPTED")
                    .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
                    .and(
                        CONNECTION_REQUESTS.SENDER_ID.eq(userId)
                            .or(CONNECTION_REQUESTS.RECIPIENT_ID.eq(userId))
                    )
            )
            .awaitFirst()
            .value1().toLong()

        val pendingRequestsSent = dsl.selectCount()
            .from(CONNECTION_REQUESTS)
            .where(
                CONNECTION_REQUESTS.SENDER_ID.eq(userId)
                    .and(CONNECTION_REQUESTS.STATUS.eq("PENDING"))
                    .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            )
            .awaitFirst()
            .value1().toLong()

        val pendingRequestsReceived = dsl.selectCount()
            .from(CONNECTION_REQUESTS)
            .where(
                CONNECTION_REQUESTS.RECIPIENT_ID.eq(userId)
                    .and(CONNECTION_REQUESTS.STATUS.eq("PENDING"))
                    .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            )
            .awaitFirst()
            .value1().toLong()

        return ConnectionDTO.ConnectionStatsOutput(
            totalConnections = totalConnections,
            pendingRequestsSent = pendingRequestsSent,
            pendingRequestsReceived = pendingRequestsReceived
        )
    }

    private suspend fun getConnectionRequestById(requestId: UUID): ConnectionDTO.ConnectionRequestOutput {
        val recipient = USERS.`as`("recipient")
        val sender = USERS.`as`("sender")
        val senderBp = BUSINESS_PROFILES.`as`("sender_bp")
        val senderIp = INDIVIDUAL_PROFILES.`as`("sender_ip")
        val recipientBp = BUSINESS_PROFILES.`as`("recipient_bp")
        val recipientIp = INDIVIDUAL_PROFILES.`as`("recipient_ip")
        val record = dsl.select(
            CONNECTION_REQUESTS.ID,
            CONNECTION_REQUESTS.SENDER_ID,
            CONNECTION_REQUESTS.RECIPIENT_ID,
            CONNECTION_REQUESTS.STATUS,
            CONNECTION_REQUESTS.MESSAGE,
            CONNECTION_REQUESTS.REASON,
            CONNECTION_REQUESTS.CREATED_AT,
            CONNECTION_REQUESTS.UPDATED_AT,
            sender.EMAIL,
            sender.USER_TYPE,
            recipient.EMAIL,
            recipient.USER_TYPE,
            senderBp.COMPANY_NAME,
            senderBp.COMPANY_EMAIL,
            senderBp.BIOGRAPHY,
            senderBp.REGISTRATION_COUNTRY,
            senderBp.PROFILE_PICTURE_URL,
            senderIp.NAME,
            senderIp.BIOGRAPHY,
            senderIp.RESIDENCE_COUNTRY,
            senderIp.PROFILE_PICTURE_URL,
            recipientBp.COMPANY_NAME,
            recipientBp.COMPANY_EMAIL,
            recipientBp.BIOGRAPHY,
            recipientBp.REGISTRATION_COUNTRY,
            recipientBp.PROFILE_PICTURE_URL,
            recipientIp.NAME,
            recipientIp.BIOGRAPHY,
            recipientIp.RESIDENCE_COUNTRY,
            recipientIp.PROFILE_PICTURE_URL
        )
            .from(CONNECTION_REQUESTS)
            .join(sender).on(CONNECTION_REQUESTS.SENDER_ID.eq(sender.ID))
            .join(recipient).on(CONNECTION_REQUESTS.RECIPIENT_ID.eq(recipient.ID))
            .leftJoin(senderBp)
            .on(sender.ID.eq(senderBp.USER_ID))
            .leftJoin(senderIp)
            .on(sender.ID.eq(senderIp.USER_ID))
            .leftJoin(recipientBp)
            .on(recipient.ID.eq(recipientBp.USER_ID))
            .leftJoin(recipientIp)
            .on(recipient.ID.eq(recipientIp.USER_ID))
            .where(CONNECTION_REQUESTS.ID.eq(requestId))
            .and(CONNECTION_REQUESTS.DELETED_AT.isNull)
            .awaitFirstOrNull() ?: throw ResourceNotFoundException("Connection request not found")

        return mapRecordToConnectionRequest(record)
    }
}

private fun mapRecordToConnectionRequest(record: Record): ConnectionDTO.ConnectionRequestOutput {
    val senderUserType = record.get(USERS.`as`("sender").USER_TYPE)!!
    val recipientUserType = record.get(USERS.`as`("recipient").USER_TYPE)!!
    val isSenderBusiness = senderUserType == "BUSINESS"
    val isRecipientBusiness = recipientUserType == "BUSINESS"
    val dbSender = USERS.`as`("sender")

    val senderBusinessProfile = BUSINESS_PROFILES.`as`("sender_bp")
    val senderIndividualProfile = INDIVIDUAL_PROFILES.`as`("sender_ip")
    val sender = ConnectionDTO.UserInfo(
        id = record.get(CONNECTION_REQUESTS.SENDER_ID).toString(),
        userType = if (isSenderBusiness) ConnectionDTO.UserInfo.UserType.BUSINESS
        else ConnectionDTO.UserInfo.UserType.INDIVIDUAL,
        profile = ConnectionDTO.ProfileInfo(
            name = if (isSenderBusiness)
                record.get(senderBusinessProfile.COMPANY_NAME) ?: "Unknown Company"
            else record.get(senderIndividualProfile.NAME) ?: "Unknown User",
            email = if (isSenderBusiness)
                record.get(senderBusinessProfile.COMPANY_EMAIL)
            else record.get(dbSender.EMAIL),
            biography = record.get(
                if (isSenderBusiness) senderBusinessProfile.BIOGRAPHY else senderIndividualProfile.BIOGRAPHY
            ),
            country = if (isSenderBusiness)
                record.get(senderBusinessProfile.REGISTRATION_COUNTRY)
            else record.get(senderIndividualProfile.RESIDENCE_COUNTRY),
            profilePictureUrl = record.get(
                if (isSenderBusiness) senderBusinessProfile.PROFILE_PICTURE_URL else senderIndividualProfile.PROFILE_PICTURE_URL
            )
        )
    )

    val recipientBusinessProfile = BUSINESS_PROFILES.`as`("recipient_bp")
    val recipientIndividualProfile = INDIVIDUAL_PROFILES.`as`("recipient_ip")
    val dbRecipient = USERS.`as`("recipient")
    val recipient = ConnectionDTO.UserInfo(
        id = record.get(CONNECTION_REQUESTS.RECIPIENT_ID).toString(),
        userType = if (isRecipientBusiness) ConnectionDTO.UserInfo.UserType.BUSINESS
        else ConnectionDTO.UserInfo.UserType.INDIVIDUAL,
        profile = ConnectionDTO.ProfileInfo(
            name = if (isRecipientBusiness)
                record.get(recipientBusinessProfile.COMPANY_NAME) ?: "Unknown Company"
            else record.get(recipientIndividualProfile.NAME) ?: "Unknown User",
            email = if (isRecipientBusiness)
                record.get(recipientBusinessProfile.COMPANY_EMAIL)
            else record.get(dbRecipient.EMAIL),
            biography = record.get(
                if (isRecipientBusiness) recipientBusinessProfile.BIOGRAPHY else recipientIndividualProfile.BIOGRAPHY
            ),
            country = if (isRecipientBusiness)
                record.get(recipientBusinessProfile.REGISTRATION_COUNTRY)
            else record.get(recipientIndividualProfile.RESIDENCE_COUNTRY),
            profilePictureUrl = record.get(
                if (isRecipientBusiness) recipientBusinessProfile.PROFILE_PICTURE_URL else recipientIndividualProfile.PROFILE_PICTURE_URL
            )
        )
    )

    return ConnectionDTO.ConnectionRequestOutput(
        id = record.get(CONNECTION_REQUESTS.ID).toString(),
        sender = sender,
        recipient = recipient,
        status = ConnectionDTO.ConnectionRequestOutput.RequestStatus.valueOf(record.get(CONNECTION_REQUESTS.STATUS)!!),
        message = record.get(CONNECTION_REQUESTS.MESSAGE),
        reason = record.get(CONNECTION_REQUESTS.REASON),
        createdAt = record.get(CONNECTION_REQUESTS.CREATED_AT)!!,
        updatedAt = record.get(CONNECTION_REQUESTS.UPDATED_AT)!!
    )
}
