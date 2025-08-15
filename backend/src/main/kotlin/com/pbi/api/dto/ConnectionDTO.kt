package com.pbi.api.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

sealed class ConnectionDTO {

    // Request DTOs
    data class SendRequestInput(
        @field:NotBlank(message = "Recipient ID is required")
        var recipientId: String? = null,
        @field:NotBlank(message = "Message is required")
        @field:Size(max = 500, message = "Message must not exceed 500 characters")
        var message: String? = null,
        @field:NotBlank(message = "Reason is required")
        var reason: String? = null
    ) : ConnectionDTO()

    data class ConnectionListInput(
        var cursor: String? = null,
        @field:Min(value = 1, message = "Size must be at least 1")
        @field:Max(value = 50, message = "Size must be at most 50")
        var size: Int = 20,
        var status: RequestStatus? = null
    ) : ConnectionDTO() {
        enum class RequestStatus {
            PENDING, ACCEPTED, REJECTED, CANCELLED
        }
    }

    data class AcceptRejectInput(
        @field:NotBlank(message = "Request ID is required")
        var requestId: String? = null,
    ) : ConnectionDTO()

    // Response DTOs
    data class ConnectionRequestOutput(
        var id: String,
        var sender: UserInfo,
        var recipient: UserInfo,
        var status: RequestStatus,
        var message: String?,
        var reason: String?,
        var createdAt: LocalDateTime,
        var updatedAt: LocalDateTime
    ) : ConnectionDTO() {
        enum class RequestStatus {
            PENDING, ACCEPTED, REJECTED, CANCELLED
        }
    }

    data class ConnectionListOutput(
        var requests: List<ConnectionRequestOutput>,
        var pagination: PaginationInfo
    ) : ConnectionDTO()

    data class ConnectionOutput(
        var connections: List<UserInfo>,
        var pagination: PaginationInfo
    ) : ConnectionDTO()

    data class ConnectionStatsOutput(
        var totalConnections: Long,
        var pendingRequestsSent: Long,
        var pendingRequestsReceived: Long
    ) : ConnectionDTO()

    // Common DTOs
    data class UserInfo(
        var id: String,
        var userType: UserType,
        var profile: ProfileInfo
    ) {
        enum class UserType {
            BUSINESS, INDIVIDUAL
        }
    }

    data class ProfileInfo(
        var name: String, // company name for business, personal name for individual
        var email: String?,
        var biography: String?,
        var country: String?,
        var profilePictureUrl: String?
    )

    data class PaginationInfo(
        var cursor: String?,
        var nextCursor: String?,
        var hasNext: Boolean,
        var size: Int
    )
}
