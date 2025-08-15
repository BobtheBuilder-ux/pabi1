package com.pbi.api.dto

sealed class PublicProfileDetailsDTO {
    data class Output(
        var userId: String? = null,
        var name: String? = null,
        var email: String? = null,
        var phone: String? = null,
        var boosted: Boolean? = null,
        var industries: Set<String>? = null,
        var interests: Set<String>? = null,
        var countryOfRegistration: String? = null,
        var countryOfResidence: String? = null,
        var connectionStatus: ConnectionStatus? = null,
        var biography: String? = null,
        var profilePictureUrl: String? = null,
        var joinedAt: String? = null, // follow this format Jan 5, 2020
    )

    enum class ConnectionStatus {
        NONE,           // No connection request exists
        REQUEST_SENT,   // Current user sent a request (PENDING)
        REQUEST_RECEIVED, // Current user received a request (PENDING)
        CONNECTED,      // Users are connected (ACCEPTED)
        REQUEST_REJECTED, // Request was rejected
        REQUEST_CANCELLED // Request was cancelled
    }
}
