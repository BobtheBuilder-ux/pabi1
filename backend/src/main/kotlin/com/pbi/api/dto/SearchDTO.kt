package com.pbi.api.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import java.util.*

sealed class SearchDTO {
    data class Input(
        var country: String? = null,
        var cursor: String? = null,
        var q: String? = null,
        var categoryIds: List<UUID>? = null,
        var hasConnection: Boolean? = null,
        @field:Min(value = 1, message = "Size must be at least 1")
        @field:Max(value = 100, message = "Size must be at most 100")
        var size: Int? = 20,
        var sort: ESortOrder? = ESortOrder.RECENT
    ) : SearchDTO() {
        enum class ESortOrder {
            NAME, RECENT
        }
    }

    data class Output(
        val users: List<UserResult>,
        val pagination: PaginationInfo,
        val filters: FilterInfo
    ) : SearchDTO() {
        data class UserResult(
            val id: String,
            val userType: EUserType,
            var profile: ProfileInfo? = null,
            val industries: Set<String>,
            val interests: Set<String>,
            val connectionStatus: ConnectionStatus? = null,
            val connectionRequestId: String? = null,
            val connectionReason: String? = null,
            val connectionMessage: String? = null,
            val connectionRequestSentAt: String? = null,
        ) {
            enum class EUserType {
                BUSINESS, INDIVIDUAL
            }

            enum class ConnectionStatus {
                NONE,           // No connection request exists
                REQUEST_SENT,   // Current user sent a request (PENDING)
                REQUEST_RECEIVED, // Current user received a request (PENDING)
                CONNECTED,      // Users are connected (ACCEPTED)
                REQUEST_REJECTED, // Request was rejected
                REQUEST_CANCELLED // Request was cancelled
            }

            data class ProfileInfo(
                val companyName: String?,
                val personalName: String?,
                val biography: String?,
                val registrationCountry: String?,
                val residenceCountry: String?,
                val profilePictureUrl: String?,
                val coverPictureUrl: String?
            )
        }

        data class PaginationInfo(
            val cursor: String?,
            val nextCursor: String?,
            val hasNext: Boolean,
            val size: Int
        )

        data class FilterInfo(
            val applied: AppliedFilters,
            val available: AvailableFilters
        ) {
            data class AppliedFilters(
                val country: String?,
                val userType: String?
            )

            data class AvailableFilters(
                val countries: List<String>,
                val userTypes: List<String>
            )
        }
    }
}
