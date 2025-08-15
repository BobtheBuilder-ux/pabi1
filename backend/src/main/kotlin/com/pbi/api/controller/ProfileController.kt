package com.pbi.api.controller

import com.pbi.api.dto.*
import com.pbi.api.service.ProfileService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.http.codec.multipart.FilePart
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/v1/profile")
class ProfileController(
    private val profileService: ProfileService
) {

    @GetMapping
    suspend fun getCurrentUserProfile(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponseDTO.Success<ProfileDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val profile = profileService.getUserProfile(userId)

        val response = ProfileDTO.Output(
            userId = profile.user.id.toString(),
            email = profile.user.email,
            userType = ProfileDTO.Output.EUserType.valueOf(profile.user.userType!!.name),
            onboardingCompletedAt = profile.user.onboardingCompletedAt,
            businessProfile = profile.businessProfile?.let { business ->
                ProfileDTO.Output.BusinessProfileData(
                    companyName = business.companyName,
                    companyEmail = business.companyEmail ?: "",
                    companyPhone = business.companyPhone,
                    ownerName = business.ownerName,
                    ownerPersonalEmail = business.ownerPersonalEmail ?: "",
                    biography = business.biography,
                    registrationCountry = business.registrationCountry,
                    residenceCountry = business.residenceCountry,
                    location = business.location,
                    profileImageUrl = business.profileImageUrl,
                    coverImageUrl = business.coverImageUrl,
                )
            },
            individualProfile = profile.individualProfile?.let { individual ->
                ProfileDTO.Output.IndividualProfileData(
                    name = individual.name,
                    phone = individual.phone,
                    biography = individual.biography,
                    nationality = individual.nationality,
                    residenceCountry = individual.residenceCountry,
                    location = individual.location,
                    profileImageUrl = individual.profileImageUrl,
                    coverImageUrl = individual.coverImageUrl,
                )
            },
            createdAt = profile.user.createdAt,
            updatedAt = profile.user.updatedAt
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Profile retrieved successfully"))
    }

    @PutMapping
    suspend fun updateProfile(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: ProfileUpdateDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<ProfileUpdateDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val updatedProfile = profileService.updateProfile(userId, request)

        val response = ProfileUpdateDTO.Output(
            userId = updatedProfile.user.id.toString(),
            message = "Profile updated successfully"
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Profile updated successfully"))
    }

    @DeleteMapping
    suspend fun deleteProfile(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponseDTO.Success<ProfileDeleteDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val success = profileService.deleteProfile(userId)

        val response = ProfileDeleteDTO.Output(
            success = success,
            message = if (success) "Profile deleted successfully" else "Failed to delete profile"
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Profile deletion processed"))
    }

    @PostMapping("/upload/avatar", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    @ResponseStatus(HttpStatus.CREATED)
    suspend fun uploadAvatar(
        @AuthenticationPrincipal userDetails: UserDetails,
        @RequestPart("file") file: FilePart
    ): ResponseEntity<ApiResponseDTO.Success<ProfileMediaDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val result = profileService.uploadProfileImage(userId, file, "avatar")

        val response = ProfileMediaDTO.Output(
            imageUrl = result.imageUrl,
            message = "Avatar uploaded successfully"
        )

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponseDTO.success(response, "Avatar uploaded successfully"))
    }

    @PostMapping("/upload/cover", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    suspend fun uploadCover(
        @AuthenticationPrincipal userDetails: UserDetails,
        @RequestPart("file") file: FilePart
    ): ResponseEntity<ApiResponseDTO.Success<ProfileMediaDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val result = profileService.uploadProfileImage(userId, file, "cover")

        val response = ProfileMediaDTO.Output(
            imageUrl = result.imageUrl,
            message = "Cover image uploaded successfully"
        )

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponseDTO.success(response, "Cover image uploaded successfully"))
    }

    @DeleteMapping("/picture/{type}")
    suspend fun deleteProfilePicture(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable type: String
    ): ResponseEntity<ApiResponseDTO.Success<ProfileMediaDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val success = profileService.deleteProfileImage(userId, type)

        val response = ProfileMediaDTO.Output(
            imageUrl = null,
            message = if (success) "$type image deleted successfully" else "Failed to delete $type image"
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "$type image deletion processed"))
    }

    @GetMapping("/pictures")
    suspend fun getProfilePictures(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponseDTO.Success<ProfilePicturesDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val pictures = profileService.getProfilePictures(userId)

        val response = ProfilePicturesDTO.Output(
            avatarUrl = pictures.avatarUrl,
            coverUrl = pictures.coverUrl
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Profile pictures retrieved successfully"))
    }

    @PutMapping("/visibility")
    suspend fun updateProfileVisibility(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: ProfileVisibilityDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<ProfileVisibilityDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val success = profileService.updateProfileVisibility(userId, request)

        val response = ProfileVisibilityDTO.Output(
            success = success,
            message = if (success) "Profile visibility updated successfully" else "Failed to update profile visibility"
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Profile visibility updated successfully"))
    }

    @GetMapping("/visibility")
    suspend fun getProfileVisibility(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponseDTO.Success<ProfileVisibilityDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val visibility = profileService.getProfileVisibility(userId)

        val response = ProfileVisibilityDTO.Output(
            success = true,
            message = "Profile visibility retrieved successfully",
            visibility = ProfileVisibilityDTO.Output.ProfileVisibilitySettings(
                isPublic = visibility.isPublic,
                showEmail = visibility.showEmail,
                showPhone = visibility.showPhone,
                allowConnections = visibility.allowConnections,
                allowMessages = visibility.allowMessages
            )
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Profile visibility retrieved successfully"))
    }

    @PostMapping("/interests")
    suspend fun addInterests(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: UserInterestsDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<UserInterestsDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val output = profileService.addInterests(userId, request)
        return ResponseEntity.ok(ApiResponseDTO.success(output, "Interests updated successfully"))
    }

    @GetMapping("/interests")
    suspend fun getInterests(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponseDTO.Success<ProfileInterestsDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val interests = profileService.getInterests(userId)
        return ResponseEntity.ok(ApiResponseDTO.success(interests, "Interests retrieved successfully"))
    }

    @DeleteMapping("/interests")
    suspend fun deleteInterests(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: UserInterestsDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<UserInterestsDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val output = profileService.deleteInterests(userId, request)
        return ResponseEntity.ok(ApiResponseDTO.success(output, "Interests deleted successfully"))
    }

    @PostMapping("/industries")
    suspend fun addIndustries(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: UserIndustriesDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<UserIndustriesDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val output = profileService.addIndustries(userId, request)
        return ResponseEntity.ok(ApiResponseDTO.success(output, "Industries updated successfully"))
    }

    @GetMapping("/industries")
    suspend fun getIndustries(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponseDTO.Success<ProfileIndustriesDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val industries = profileService.getIndustries(userId)
        return ResponseEntity.ok(ApiResponseDTO.success(industries, "Industries retrieved successfully"))
    }

    @DeleteMapping("/industries")
    suspend fun deleteIndustries(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: UserIndustriesDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<UserIndustriesDTO.Output>> {
        val userId = UUID.fromString(userDetails.username)
        val output = profileService.deleteIndustries(userId, request)
        return ResponseEntity.ok(ApiResponseDTO.success(output, "Industries deleted successfully"))
    }


    @GetMapping("/{userId}/public-details")
    suspend fun getPublicProfileDetails(
        @PathVariable userId: String,
        @AuthenticationPrincipal userDetails: UserDetails?
    ): ResponseEntity<ApiResponseDTO.Success<PublicProfileDetailsDTO.Output>> {
        val targetUserId = UUID.fromString(userId)
        val currentUserId = UUID.fromString(userDetails!!.username)
        val publicDetails = profileService.getPublicProfileDetails(targetUserId, currentUserId)
        return ResponseEntity.ok(ApiResponseDTO.success(publicDetails, "Public profile details retrieved successfully"))
    }

    @PatchMapping("/me")
    suspend fun updateProfileDetails(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: ProfileDetailsUpdateDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<Nothing>> {
        val userId = UUID.fromString(userDetails.username)
        profileService.updateProfileDetails(userId, request)
        return ResponseEntity.ok(ApiResponseDTO.success(message = "Profile details updated successfully"))
    }

}