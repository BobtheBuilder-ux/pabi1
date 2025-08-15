package com.pbi.api.service

import com.pbi.api.domain.BusinessProfile
import com.pbi.api.domain.UserType
import com.pbi.api.dto.*
import com.pbi.api.exception.UserNotFoundException
import com.pbi.api.exception.ValidationException
import com.pbi.api.repository.*
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.springframework.http.codec.multipart.FilePart
import org.springframework.stereotype.Service
import org.springframework.transaction.reactive.TransactionalOperator
import org.springframework.transaction.reactive.executeAndAwait
import java.io.File
import java.time.LocalDateTime
import java.util.*

@Service
class ProfileService(
    private val userRepository: UserRepository,
    private val businessProfileRepository: BusinessProfileRepository,
    private val individualProfileRepository: IndividualProfileRepository,
    private val fileUploadService: FileUploadService,
    private val transactionalOperator: TransactionalOperator,
    private val categoryRepository: CategoryRepository
) {

    private val logger = KotlinLogging.logger {}

    suspend fun getUserProfile(userId: UUID): UserWithProfile {
        return userRepository.findUserWithProfile(userId)
            ?: throw UserNotFoundException("User profile not found")
    }

    suspend fun updateProfile(userId: UUID, request: ProfileUpdateDTO.Input): UserWithProfile {
        val userWithProfile = getUserProfile(userId)

        return transactionalOperator.executeAndAwait {
            when (userWithProfile.user.userType) {
                UserType.BUSINESS -> {
                    userWithProfile.businessProfile?.let { businessProfile ->
                        val updatedProfile = businessProfile.copy(
                            companyName = request.companyName ?: businessProfile.companyName,
                            companyEmail = request.companyEmail ?: businessProfile.companyEmail,
                            companyPhone = request.companyPhone ?: businessProfile.companyPhone,
                            ownerName = request.ownerName ?: businessProfile.ownerName,
                            ownerPersonalEmail = request.ownerPersonalEmail ?: businessProfile.ownerPersonalEmail,
                            biography = request.biography ?: businessProfile.biography,
                            registrationCountry = request.registrationCountry ?: businessProfile.registrationCountry,
                            residenceCountry = request.residenceCountry ?: businessProfile.residenceCountry,
                            location = request.location ?: businessProfile.location,
                            updatedAt = LocalDateTime.now()
                        )
                        businessProfileRepository.save(updatedProfile)
                    }
                }

                UserType.INDIVIDUAL -> {
                    userWithProfile.individualProfile?.let { individualProfile ->
                        val updatedProfile = individualProfile.copy(
                            name = request.name ?: individualProfile.name,
                            phone = request.phone ?: individualProfile.phone,
                            biography = request.biography ?: individualProfile.biography,
                            nationality = request.nationality ?: individualProfile.nationality,
                            residenceCountry = request.residenceCountry ?: individualProfile.residenceCountry,
                            location = request.location ?: individualProfile.location,
                            updatedAt = LocalDateTime.now()
                        )
                        individualProfileRepository.save(updatedProfile)
                    }
                }

                else -> throw ValidationException("Profile type not supported for updates")
            }

            userRepository.findUserWithProfile(userId)
                ?: throw UserNotFoundException("User profile not found after update")
        }
    }

    suspend fun deleteProfile(userId: UUID): Boolean {
        return try {
            userRepository.delete(userId)
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun uploadProfileImage(userId: UUID, file: FilePart, type: String): ProfileMediaResult {
        //TODO DELETE EXISTING IMAGE
        val validTypes = listOf("avatar", "cover")
        if (type !in validTypes) {
            throw ValidationException("Invalid image type: $type. Allowed types are: ${validTypes.joinToString(", ")}")
        }

        val extension = file.filename().substringAfterLast('.', "")
        if (extension.isEmpty()) {
            throw ValidationException("File must have an extension")
        }
        val destinationFile = File.createTempFile("profile_image_${type}_$userId", ".$extension")
        destinationFile.deleteOnExit()
        file.transferTo(destinationFile).awaitFirstOrNull()
        if (!destinationFile.exists() || destinationFile.length() == 0L) {
            throw ValidationException("Failed to save uploaded file")
        }

        // Validate file
        validateImageFile(destinationFile)

        val userWithProfile = getUserProfile(userId)

        return transactionalOperator.executeAndAwait {
            // Upload file
            val uploadResult = fileUploadService.uploadImage(destinationFile, "PBI/profiles/$userId/$type")

            // Update profile with new image URL
            when (userWithProfile.user.userType) {
                UserType.BUSINESS -> {
                    userWithProfile.businessProfile?.let { businessProfile ->
                        val updatedProfile = when (type) {
                            "avatar" -> businessProfile.copy(
                                profileImageUrl = uploadResult.url,
                                updatedAt = LocalDateTime.now()
                            )

                            "cover" -> businessProfile.copy(
                                coverImageUrl = uploadResult.url,
                                updatedAt = LocalDateTime.now()
                            )

                            else -> throw ValidationException("Invalid image type: $type")
                        }
                        businessProfileRepository.save(updatedProfile)
                    }
                }

                UserType.INDIVIDUAL -> {
                    userWithProfile.individualProfile?.let { individualProfile ->
                        val updatedProfile = when (type) {
                            "avatar" -> individualProfile.copy(
                                profileImageUrl = uploadResult.url,
                                updatedAt = LocalDateTime.now()
                            )

                            "cover" -> individualProfile.copy(
                                coverImageUrl = uploadResult.url,
                                updatedAt = LocalDateTime.now()
                            )

                            else -> throw ValidationException("Invalid image type: $type")
                        }
                        individualProfileRepository.save(updatedProfile)
                    }
                }

                else -> throw ValidationException("Profile type not supported for image uploads")
            }

            ProfileMediaResult(
                imageUrl = uploadResult.url,
                message = "$type image uploaded successfully"
            )
        }
    }

    suspend fun deleteProfileImage(userId: UUID, type: String): Boolean {
        val userWithProfile = getUserProfile(userId)

        return transactionalOperator.executeAndAwait {
            try {
                when (userWithProfile.user.userType) {
                    UserType.BUSINESS -> {
                        userWithProfile.businessProfile?.let { businessProfile ->
                            val updatedProfile = when (type) {
                                "avatar" -> businessProfile.copy(
                                    profileImageUrl = null,
                                    updatedAt = LocalDateTime.now()
                                )

                                "cover" -> businessProfile.copy(
                                    coverImageUrl = null,
                                    updatedAt = LocalDateTime.now()
                                )

                                else -> throw ValidationException("Invalid image type: $type")
                            }
                            businessProfileRepository.save(updatedProfile)
                        }
                    }

                    UserType.INDIVIDUAL -> {
                        userWithProfile.individualProfile?.let { individualProfile ->
                            val updatedProfile = when (type) {
                                "avatar" -> individualProfile.copy(
                                    profileImageUrl = null,
                                    updatedAt = LocalDateTime.now()
                                )

                                "cover" -> individualProfile.copy(
                                    coverImageUrl = null,
                                    updatedAt = LocalDateTime.now()
                                )

                                else -> throw ValidationException("Invalid image type: $type")
                            }
                            individualProfileRepository.save(updatedProfile)
                        }
                    }

                    else -> throw ValidationException("Profile type not supported for image operations")
                }
                true
            } catch (e: Exception) {
                false
            }
        }
    }

    suspend fun getProfilePictures(userId: UUID): ProfilePicturesResult {
        val userWithProfile = getUserProfile(userId)

        return when (userWithProfile.user.userType) {
            UserType.BUSINESS -> {
                userWithProfile.businessProfile?.let { businessProfile ->
                    ProfilePicturesResult(
                        avatarUrl = businessProfile.profileImageUrl,
                        coverUrl = businessProfile.coverImageUrl
                    )
                } ?: ProfilePicturesResult(null, null)
            }

            UserType.INDIVIDUAL -> {
                userWithProfile.individualProfile?.let { individualProfile ->
                    ProfilePicturesResult(
                        avatarUrl = individualProfile.profileImageUrl,
                        coverUrl = individualProfile.coverImageUrl
                    )
                } ?: ProfilePicturesResult(null, null)
            }

            else -> ProfilePicturesResult(null, null)
        }
    }

    suspend fun updateProfileVisibility(userId: UUID, request: ProfileVisibilityDTO.Input): Boolean {
        // For now, we'll implement basic visibility settings
        // In a full implementation, this would update visibility flags in the database
        return true
    }

    suspend fun getProfileVisibility(userId: UUID): ProfileVisibilitySettings {
        // For now, return default visibility settings
        // In a full implementation, this would retrieve from database
        return ProfileVisibilitySettings(
            isPublic = true,
            showEmail = false,
            showPhone = false,
            allowConnections = true,
            allowMessages = true
        )
    }

    private fun validateImageFile(file: File) {

        val allowedTypes = listOf("jpeg", "jpg", "png", "gif")
        if (file.extension.lowercase() !in allowedTypes) {
            throw ValidationException("Invalid image file type. Allowed types: ${allowedTypes.joinToString(", ")}")
        }
    }

    suspend fun addInterests(userId: UUID, interestsDTO: UserInterestsDTO.Input): UserInterestsDTO.Output {
        val (_, onboardingCompletedAt) = userRepository.fetchUserOnboardingStatusById(userId)
            ?: throw UserNotFoundException("User not found with id: $userId")

        interestsDTO.categories.isNullOrEmpty() && throw ValidationException("Interests list cannot be empty")

        val requestedCategories = categoryRepository.findByIds(interestsDTO.categories!!.toList())
        if (requestedCategories.size != interestsDTO.categories!!.size) {
            throw ValidationException("Some categories do not exist")
        }

        val parentCategories = requestedCategories.filter { it.parentId == null }.map { it.id }
        val subCategories = if (parentCategories.isNotEmpty()) {
            categoryRepository.findByParentIds(parentCategories).map { it.id }
        } else {
            emptyList()
        }

        val childCategories = requestedCategories.filter { it.parentId != null }.map { it.id }
        val categoriesToAdd = (subCategories + childCategories).toSet()

        val existingInterests = userRepository.findAllUserInterests(userId)
        val newInterests = categoriesToAdd - existingInterests.map { it.id }.toSet()

        if (newInterests.isEmpty()) {
            return UserInterestsDTO.Output(
                userId = userId,
                categories = existingInterests.map { it.id }
            )
        }

        userRepository.addUserInterests(userId, newInterests)

        if (onboardingCompletedAt == null && userRepository.hasIndustries(userId)) {
            userRepository.updateOnboardingStatus(userId, LocalDateTime.now())
            logger.info { "User onboarding completed for userId: $userId" }
        }

        return UserInterestsDTO.Output(
            userId = userId,
            categories = existingInterests.map { it.id } + newInterests
        )
    }

    suspend fun getInterests(userId: UUID): ProfileInterestsDTO.Output {
        userRepository.existsById(userId) || throw UserNotFoundException("User not found with id: $userId")

        val interests = userRepository.findAllUserInterestsTree(userId)
        return ProfileInterestsDTO.Output(
            categories = interests.map {
                ProfileInterestsDTO.CategoryInfo(
                    id = it.id,
                    name = it.name,
                    description = it.description,
                    subCategories = it.subCategories.map { sub ->
                        ProfileInterestsDTO.SubcategoryInfo(
                            id = sub.id,
                            name = sub.name,
                            description = sub.description
                        )
                    }
                )
            }
        )
    }

    suspend fun deleteInterests(userId: UUID, request: UserInterestsDTO.Input): UserInterestsDTO.Output {
        userRepository.existsById(userId) || throw UserNotFoundException("User not found with id: $userId")

        request.categories.isNullOrEmpty() && throw ValidationException("Interests list cannot be empty")

        val existingInterests = userRepository.findAllUserInterests(userId)
        val existingInterestIds = existingInterests.map { it.id }.toSet()

        val requestedCategories = categoryRepository.findByIds(request.categories!!.toList())
        val parentCategories = requestedCategories.filter { it.parentId == null }.map { it.id }
        val subCategories = if (parentCategories.isNotEmpty()) {
            categoryRepository.findByParentIds(parentCategories).map { it.id }
        } else {
            emptyList()
        }

        val allCategoriesToDelete = (request.categories!!.toSet() + subCategories).filter { it in existingInterestIds }

        if (allCategoriesToDelete.isEmpty()) {
            throw ValidationException("No valid categories to delete")
        }

        userRepository.removeUserInterests(userId, allCategoriesToDelete.toSet())

        return UserInterestsDTO.Output(
            userId = userId,
            categories = (existingInterestIds - allCategoriesToDelete.toSet()).toList()
        )
    }

    suspend fun addIndustries(userId: UUID, request: UserIndustriesDTO.Input): UserIndustriesDTO.Output {
        val (_, onboardingCompletedAt) = userRepository.fetchUserOnboardingStatusById(userId)
            ?: throw UserNotFoundException("User not found with id: $userId")

        request.categories.isNullOrEmpty() && throw ValidationException("Industries list cannot be empty")

        val requestedCategories = categoryRepository.findByIds(request.categories!!.toList())
        if (requestedCategories.size != request.categories!!.size) {
            throw ValidationException("Some industries do not exist")
        }

        val parentCategories = requestedCategories.filter { it.parentId == null }.map { it.id }
        val subCategories = if (parentCategories.isNotEmpty()) {
            categoryRepository.findByParentIds(parentCategories).map { it.id }
        } else {
            emptyList()
        }

        val childCategories = requestedCategories.filter { it.parentId != null }.map { it.id }
        val categoriesToAdd = (subCategories + childCategories).toSet()

        val existingIndustries = userRepository.findAllUserIndustries(userId)
        val newIndustries = categoriesToAdd - existingIndustries.map { it.id }.toSet()

        if (onboardingCompletedAt == null && userRepository.hasInterests(userId)) {
            userRepository.updateOnboardingStatus(userId, LocalDateTime.now())
            logger.info { "User onboarding completed for userId: $userId" }
        }

        if (newIndustries.isEmpty()) {
            return UserIndustriesDTO.Output(
                userId = userId,
                categories = existingIndustries.map { it.id }
            )
        }

        userRepository.addUserIndustries(userId, newIndustries)

        return UserIndustriesDTO.Output(
            userId = userId,
            categories = existingIndustries.map { it.id } + newIndustries
        )
    }

    suspend fun getIndustries(userId: UUID): ProfileIndustriesDTO.Output {
        userRepository.existsById(userId) || throw UserNotFoundException("User not found with id: $userId")

        val industries = userRepository.findAllUserIndustriesTreeWithBoostStatus(userId)
        return ProfileIndustriesDTO.Output(
            categories = industries.map {
                ProfileIndustriesDTO.CategoryInfo(
                    id = it.id,
                    name = it.name,
                    description = it.description,
                    subCategories = it.subCategories.map { sub ->
                        ProfileIndustriesDTO.SubcategoryInfo(
                            id = sub.id,
                            name = sub.name,
                            description = sub.description,
                            boosted = sub.isBoosted,
                            boostExpiresAt = sub.boostExpiresAt
                        )
                    },
                )
            }
        )
    }

    suspend fun deleteIndustries(userId: UUID, request: UserIndustriesDTO.Input): UserIndustriesDTO.Output {
        userRepository.existsById(userId) || throw UserNotFoundException("User not found with id: $userId")

        request.categories.isNullOrEmpty() && throw ValidationException("Industries list cannot be empty")

        val existingIndustries = userRepository.findAllUserIndustries(userId)
        val existingIndustryIds = existingIndustries.map { it.id }.toSet()

        val requestedCategories = categoryRepository.findByIds(request.categories!!.toList())
        val parentCategories = requestedCategories.filter { it.parentId == null }.map { it.id }
        val subCategories = if (parentCategories.isNotEmpty()) {
            categoryRepository.findByParentIds(parentCategories).map { it.id }
        } else {
            emptyList()
        }

        val allCategoriesToDelete = (request.categories!!.toSet() + subCategories).filter { it in existingIndustryIds }

        if (allCategoriesToDelete.isEmpty()) {
            throw ValidationException("No valid industries to delete")
        }

        userRepository.removeUserIndustries(userId, allCategoriesToDelete.toSet())

        return UserIndustriesDTO.Output(
            userId = userId,
            categories = (existingIndustryIds - allCategoriesToDelete.toSet()).toList()
        )
    }

    suspend fun getPublicProfileDetails(targetUserId: UUID, currentUserId: UUID): PublicProfileDetailsDTO.Output {
        return userRepository.findPublicProfileDetails(targetUserId, currentUserId)
            ?: throw UserNotFoundException("Public profile details not found for userId: $targetUserId")
    }

    suspend fun updateProfileDetails(userId: UUID, request: ProfileDetailsUpdateDTO.Input) {
        val (_, userEmail, userType, profileId) = userRepository.findUserTypeWithProfileId(userId)
            ?: throw UserNotFoundException("User not found with id: $userId")

        var theProfileId = profileId
        if (theProfileId == null && userType == UserType.BUSINESS.name) {
            // Create business profile
            val businessProfile = BusinessProfile(
                id = UUID(0, 0), // Will be generated by database
                userId = userId,
                companyName = request.name ?: "",
                companyEmail = userEmail,
                companyPhone = request.phone,
                ownerName = request.name ?: "",
                ownerPersonalEmail = userEmail,
                biography = request.biography,
                registrationCountry = request.nationality,
                residenceCountry = request.countryOfResidence,
                location = null,
                profileImageUrl = null,
                coverImageUrl = null,
                deletedAt = null,
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now()
            )

            val savedProfile = businessProfileRepository.save(businessProfile)
            theProfileId = savedProfile.id
        }

        when (userType) {
            UserType.BUSINESS.name -> {
                businessProfileRepository.updateProfileDetails(
                    theProfileId!!,
                    request.name,
                    request.phone,
                    request.biography,
                    request.nationality,
                    request.countryOfResidence
                )
            }

            UserType.INDIVIDUAL.name -> {
                individualProfileRepository.updateProfileDetails(
                    theProfileId!!,
                    request.name,
                    request.phone,
                    request.biography,
                    request.nationality,
                    request.countryOfResidence
                )
            }
        }
    }

    // Data classes for service results
    data class ProfileMediaResult(
        val imageUrl: String,
        val message: String
    )

    data class ProfilePicturesResult(
        val avatarUrl: String?,
        val coverUrl: String?
    )

    data class ProfileVisibilitySettings(
        val isPublic: Boolean,
        val showEmail: Boolean,
        val showPhone: Boolean,
        val allowConnections: Boolean,
        val allowMessages: Boolean
    )
}