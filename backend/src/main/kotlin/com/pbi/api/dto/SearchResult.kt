package com.pbi.api.dto

import com.pbi.api.domain.UserType
import java.time.LocalDateTime
import java.util.*

data class SearchResult(
    val userId: UUID,
    val email: String,
    val userType: UserType?,
    val activatedAt: LocalDateTime?,
    val companyName: String?,
    val businessBiography: String?,
    val registrationCountry: String?,
    val businessResidenceCountry: String?,
    val businessProfilePictureUrl: String?,
    val businessCoverPictureUrl: String?,
    val personalName: String?,
    val individualBiography: String?,
    val nationality: String?,
    val individualResidenceCountry: String?,
    val individualProfilePictureUrl: String?,
    val individualCoverPictureUrl: String?,
    val interests: Set<String> = emptySet(),
    val industries: Set<String> = emptySet(),
    val connectionStatus: String?,
    val connectionSenderId: UUID?,
    val connectionRequestId: UUID?,
    val connectionReason: String?,
    val connectionMessage: String?,
    val connectionRequestSentAt: LocalDateTime?,
)

