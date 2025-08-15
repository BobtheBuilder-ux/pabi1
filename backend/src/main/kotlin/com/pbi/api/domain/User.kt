package com.pbi.api.domain

import java.time.LocalDateTime
import java.util.*

data class User(
    val id: UUID,
    val email: String,
    val passwordHash: String? = null,
    val userType: UserType? = null,
    val linkedinId: String? = null,
    val activatedAt: LocalDateTime? = null,
    val verifiedAt: LocalDateTime? = null,
    val verificationToken: String? = null,
    val resetPasswordToken: String? = null,
    val resetPasswordExpiresAt: LocalDateTime? = null,
    val deletedAt: LocalDateTime? = null,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null,
    val roles: Set<String> = emptySet(),
    val permissions: Set<String> = emptySet(),
    val onboardingCompletedAt: LocalDateTime? = null,
)

enum class UserType {
    BUSINESS, INDIVIDUAL, ADMIN
}

enum class ConnectionStatus {
    PENDING, ACCEPTED, REJECTED, CANCELLED
}

data class BusinessProfile(
    val id: UUID,
    val userId: UUID,
    val companyName: String,
    val companyEmail: String?,
    val companyPhone: String?,
    val ownerName: String,
    val ownerPersonalEmail: String?,
    val biography: String?,
    val registrationCountry: String?,
    val residenceCountry: String?,
    val location: String?,
    val profileImageUrl: String?,
    val coverImageUrl: String?,
    val deletedAt: LocalDateTime?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class IndividualProfile(
    val id: UUID,
    val userId: UUID,
    val name: String,
    val phone: String?,
    val biography: String?,
    val nationality: String,
    val residenceCountry: String?,
    val location: String?,
    val profileImageUrl: String?,
    val coverImageUrl: String?,
    val deletedAt: LocalDateTime?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class AdminProfile(
    val id: UUID,
    val userId: UUID,
    val name: String,
    val department: String?,
    val jobTitle: String?,
    val phone: String?,
    val notes: String?,
    val deletedAt: LocalDateTime?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class Category(
    val id: UUID,
    val name: String,
    val description: String? = null,
    val isBoosted: Boolean = false,
    val boostExpiresAt: LocalDateTime? = null,
    val parentId: UUID? = null,
    val activatedAt: LocalDateTime? = null,
    val deletedAt: LocalDateTime? = null,
    val createdAt: LocalDateTime? = null,
    val updatedAt: LocalDateTime? = null
)

data class CategoryTree(
    val id: UUID,
    val name: String,
    val description: String? = null,
    val subCategories: List<SubCategory> = emptyList()
) {
    data class SubCategory(
        val id: UUID,
        val name: String,
        val description: String? = null,
        val isBoosted: Boolean = false,
        val boostExpiresAt: LocalDateTime? = null,
    )
}

data class ConnectionRequest(
    val id: UUID,
    val senderId: UUID,
    val recipientId: UUID,
    val status: ConnectionStatus,
    val message: String?,
    val deletedAt: LocalDateTime?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class Role(
    val id: UUID,
    val name: String,
    val description: String?,
    val isSystemRole: Boolean = false,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val permissions: Set<Permission> = emptySet()
)

data class Permission(
    val id: UUID,
    val name: String,
    val description: String?,
    val resource: String,
    val action: String,
    val isSystemPermission: Boolean = false,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)