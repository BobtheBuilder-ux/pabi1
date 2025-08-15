package com.pbi.api.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.*

sealed class LoginDTO {
    data class Input(
        @field:Email(message = "Invalid email format")
        @field:NotBlank(message = "Email is required")
        val email: String,

        @field:NotBlank(message = "Password is required")
        @field:Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
        val password: String
    ) : LoginDTO()

    data class Output(
        val accessToken: String,
        val refreshToken: String,
        val expiresIn: Long,
        val userType: EUserType,
        val email: String,
        val onboardingCompletedAt: LocalDateTime?
    ) : LoginDTO() {
        enum class EUserType {
            BUSINESS, INDIVIDUAL, ADMIN
        }
    }
}

sealed class BusinessRegistrationDTO {
    data class Input(
        @field:NotBlank(message = "Company name is required")
        @field:Size(min = 2, max = 255, message = "Company name must be between 2 and 255 characters")
        var companyName: String? = null,

        @field:Email(message = "Invalid company email format")
        @field:NotBlank(message = "Company email is required")
        var companyEmail: String? = null,

        @field:Size(max = 50, message = "Company phone must not exceed 50 characters")
        var companyPhone: String? = null,

        @field:NotBlank(message = "Personal name is required")
        @field:Size(min = 2, max = 255, message = "Personal name must be between 2 and 255 characters")
        var personalName: String? = null,

        @field:Email(message = "Invalid personal email format")
        @field:NotBlank(message = "Personal email is required")
        var personalEmail: String? = null,

        @field:NotBlank(message = "Password is required")
        @field:Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
        var password: String? = null,

        @field:NotBlank(message = "Registration country is required")
        @field:Size(min = 2, max = 100, message = "Registration country must be between 2 and 100 characters")
        var registrationCountry: String? = null,

        @field:Size(max = 100, message = "Residence country must not exceed 100 characters")
        var residenceCountry: String? = null,

        @field:Size(max = 500, message = "Biography must not exceed 500 characters")
        @field:NotBlank(message = "Biography is required")
        var biography: String? = null
    ) : BusinessRegistrationDTO()

    data class Output(
        val userId: String,
        val email: String,
        val userType: EUserType,
        val message: String
    ) : BusinessRegistrationDTO() {
        enum class EUserType {
            BUSINESS
        }
    }
}

sealed class IndividualRegistrationDTO {
    data class Input(
        @field:NotBlank(message = "Name is required")
        @field:Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
        val name: String?,

        @field:Email(message = "Invalid email format")
        @field:NotBlank(message = "Email is required")
        val email: String?,

        @field:Size(max = 50, message = "Phone must not exceed 50 characters")
        val phone: String?,

        @field:NotBlank(message = "Password is required")
        @field:Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
        val password: String?,

        @field:NotBlank(message = "Nationality is required")
        @field:Size(min = 2, max = 100, message = "Nationality must be between 2 and 100 characters")
        val nationality: String?,

        @field:Size(max = 100, message = "Residence country must not exceed 100 characters")
        val residenceCountry: String?,

        @field:Size(max = 500, message = "Biography must not exceed 500 characters")
        @field:NotBlank(message = "Biography is required")
        val biography: String? = null
    ) : IndividualRegistrationDTO()

    data class Output(
        val userId: String,
        val email: String,
        val userType: EUserType,
        val message: String
    ) : IndividualRegistrationDTO() {
        enum class EUserType {
            INDIVIDUAL
        }
    }
}

sealed class RefreshTokenDTO {
    data class Input(
        @field:NotBlank(message = "Refresh token is required")
        var refreshToken: String? = null
    ) : RefreshTokenDTO()

    data class Output(
        val accessToken: String,
        val refreshToken: String,
        val expiresIn: Long
    ) : RefreshTokenDTO()
}

sealed class EmailVerificationDTO {
    data class Output(
        val userId: String,
        val email: String,
        val message: String
    ) : EmailVerificationDTO()
}

sealed class ForgotPasswordDTO {
    data class Input(
        @field:Email(message = "Invalid email format")
        @field:NotBlank(message = "Email is required")
        val email: String
    ) : ForgotPasswordDTO()

    data class Output(
        val success: Boolean,
        val message: String
    ) : ForgotPasswordDTO()
}

sealed class ResetPasswordDTO {
    data class Input(
        @field:NotBlank(message = "Reset token is required")
        val token: String,

        @field:NotBlank(message = "New password is required")
        @field:Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
        val newPassword: String
    ) : ResetPasswordDTO()

    data class Output(
        val success: Boolean,
        val message: String
    ) : ResetPasswordDTO()
}

// Profile Management DTOs
sealed class ProfileDTO {
    data class Output(
        val userId: String,
        val email: String,
        val userType: EUserType,
        val onboardingCompletedAt: LocalDateTime?,
        val businessProfile: BusinessProfileData?,
        val individualProfile: IndividualProfileData?,
        val createdAt: LocalDateTime?,
        val updatedAt: LocalDateTime?
    ) : ProfileDTO() {
        enum class EUserType {
            BUSINESS, INDIVIDUAL, ADMIN
        }

        data class BusinessProfileData(
            val companyName: String,
            val companyEmail: String,
            val companyPhone: String?,
            val ownerName: String,
            val ownerPersonalEmail: String,
            val biography: String?,
            val registrationCountry: String?,
            val residenceCountry: String?,
            val location: String?,
            val profileImageUrl: String?,
            val coverImageUrl: String?,
        )

        data class IndividualProfileData(
            val name: String,
            val phone: String?,
            val biography: String?,
            val nationality: String,
            val residenceCountry: String?,
            val location: String?,
            val profileImageUrl: String?,
            val coverImageUrl: String?,
        )
    }
}

sealed class ProfileUpdateDTO {
    data class Input(
        // Business profile fields
        @field:Size(min = 2, max = 255, message = "Company name must be between 2 and 255 characters")
        val companyName: String?,

        @field:Email(message = "Invalid company email format")
        val companyEmail: String?,

        @field:Size(max = 50, message = "Company phone must not exceed 50 characters")
        val companyPhone: String?,

        @field:Size(min = 2, max = 255, message = "Owner name must be between 2 and 255 characters")
        val ownerName: String?,

        @field:Email(message = "Invalid owner email format")
        val ownerPersonalEmail: String?,

        @field:Size(max = 100, message = "Registration country must not exceed 100 characters")
        val registrationCountry: String?,

        // Individual profile fields
        @field:Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
        val name: String?,

        @field:Size(max = 50, message = "Phone must not exceed 50 characters")
        val phone: String?,

        @field:Size(max = 100, message = "Nationality must not exceed 100 characters")
        val nationality: String?,

        // Common fields
        @field:Size(max = 100, message = "Residence country must not exceed 100 characters")
        val residenceCountry: String?,

        @field:Size(max = 1000, message = "Biography must not exceed 1000 characters")
        val biography: String?,

        @field:Size(max = 500, message = "Location must not exceed 500 characters")
        val location: String?
    ) : ProfileUpdateDTO()

    data class Output(
        val userId: String,
        val message: String
    ) : ProfileUpdateDTO()
}

sealed class ProfileDeleteDTO {
    data class Output(
        val success: Boolean,
        val message: String
    ) : ProfileDeleteDTO()
}

sealed class ProfileMediaDTO {
    data class Output(
        val imageUrl: String?,
        val message: String
    ) : ProfileMediaDTO()
}

sealed class ProfilePicturesDTO {
    data class Output(
        val avatarUrl: String?,
        val coverUrl: String?
    ) : ProfilePicturesDTO()
}

sealed class ProfileVisibilityDTO {
    data class Input(
        val isPublic: Boolean = true,
        val showEmail: Boolean = false,
        val showPhone: Boolean = false,
        val allowConnections: Boolean = true,
        val allowMessages: Boolean = true
    ) : ProfileVisibilityDTO()

    data class Output(
        val success: Boolean,
        val message: String,
        val visibility: ProfileVisibilitySettings? = null
    ) : ProfileVisibilityDTO() {
        data class ProfileVisibilitySettings(
            val isPublic: Boolean,
            val showEmail: Boolean,
            val showPhone: Boolean,
            val allowConnections: Boolean,
            val allowMessages: Boolean
        )
    }
}

sealed class UserInterestsDTO {
    data class Input(
        @field:NotEmpty(message = "categories cannot be empty")
        var categories: Set<UUID>? = null,
    ) : UserInterestsDTO()

    data class Output(
        val userId: UUID,
        val categories: List<UUID>,
    ) : UserInterestsDTO()
}

sealed class UserIndustriesDTO {
    data class Input(
        @field:NotEmpty(message = "categories cannot be empty")
        var categories: Set<UUID>? = null,
    ) : UserIndustriesDTO()

    data class Output(
        val userId: UUID,
        val categories: List<UUID>,
    ) : UserIndustriesDTO()
}

sealed class ProfileInterestsDTO {
    data class Output(
        val categories: List<CategoryInfo>
    ) : ProfileInterestsDTO()

    data class CategoryInfo(
        val id: UUID,
        val name: String,
        val description: String?,
        val subCategories: List<SubcategoryInfo> = emptyList(),
    )

    data class SubcategoryInfo(
        val id: UUID,
        val name: String,
        val description: String?,
    )
}

sealed class ProfileIndustriesDTO {
    data class Output(
        val categories: List<CategoryInfo>
    ) : ProfileIndustriesDTO()

    data class CategoryInfo(
        val id: UUID,
        val name: String,
        val description: String?,
        val subCategories: List<SubcategoryInfo> = emptyList(),
    )

    data class SubcategoryInfo(
        val id: UUID,
        val name: String,
        val description: String?,
        val boosted: Boolean? = false,
        val boostExpiresAt: LocalDateTime? = null
    )
}

// Category Management DTOs
sealed class CategoryDTO {
    data class Output(
        val id: String,
        val name: String,
        val description: String?,
        val parentId: String?,
        val createdAt: LocalDateTime?,
        val updatedAt: LocalDateTime?
    ) : CategoryDTO()
}

sealed class CategoryTreeDTO {
    data class Output(
        val id: String,
        val name: String,
        val description: String?,
        val subcategories: List<SubcategoryNode>
    ) : CategoryTreeDTO() {
        data class SubcategoryNode(
            val id: String,
            val name: String,
            val description: String?
        )
    }
} 