package com.pbi.api.service

import com.pbi.api.domain.User
import com.pbi.api.exception.InvalidCredentialsException
import com.pbi.api.exception.InvalidTokenException
import com.pbi.api.exception.UserNotFoundException
import com.pbi.api.security.jwt.JwtTokenProvider
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class AuthenticationService(
    private val userService: UserService,
    private val jwtService: JwtTokenProvider
) {

    suspend fun login(email: String, password: String): LoginResult {
        val user = userService.authenticateUser(email, password)
            ?: throw InvalidCredentialsException("Invalid email or password")

        val tokenPair = jwtService.generateTokenPair(
            userId = user.id,
            email = user.email,
            userType = user.userType!!.name,
            roles = user.roles,
            permissions = user.permissions
        )

        return LoginResult(
            user = user,
            accessToken = tokenPair.accessToken,
            refreshToken = tokenPair.refreshToken,
            expiresIn = tokenPair.expiresIn,
            onboardingCompletedAt = user.onboardingCompletedAt
        )
    }

    suspend fun registerBusinessUser(request: BusinessRegistrationRequest): RegistrationResult {
        val userWithProfile = userService.createBusinessUser(
            email = request.companyEmail,
            password = request.password,
            companyName = request.companyName,
            companyEmail = request.companyEmail,
            companyPhone = request.companyPhone,
            personalName = request.personalName,
            personalEmail = request.personalEmail,
            registrationCountry = request.registrationCountry ?: "",
            residenceCountry = request.residenceCountry,
            biography = request.biography
        )

        return RegistrationResult(
            user = userWithProfile.user,
            message = "Business user registered successfully. Please check your email to verify your account before logging in."
        )
    }

    suspend fun registerIndividualUser(request: IndividualRegistrationRequest): RegistrationResult {
        val userWithProfile = userService.createIndividualUser(
            email = request.email,
            password = request.password,
            name = request.name,
            phone = request.phone,
            nationality = request.nationality ?: "",
            residenceCountry = request.residenceCountry
        )

        return RegistrationResult(
            user = userWithProfile.user,
            message = "Individual user registered successfully. Please check your email to verify your account before logging in."
        )
    }

    suspend fun refreshToken(refreshToken: String): RefreshTokenResult {
        if (!jwtService.validateToken(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            throw InvalidTokenException("Invalid refresh token")
        }

        val userId = jwtService.extractUserId(refreshToken)
        val user = userService.authenticationFindById(userId)
            ?: throw UserNotFoundException("User not found")

        val newTokenPair = jwtService.generateTokenPair(
            userId = user.id,
            email = user.email,
            userType = user.userType!!.name,
            roles = user.roles,
            permissions = user.permissions
        )

        return RefreshTokenResult(
            accessToken = newTokenPair.accessToken,
            refreshToken = newTokenPair.refreshToken,
            expiresIn = newTokenPair.expiresIn
        )
    }
    
    suspend fun verifyEmail(token: String): EmailVerificationResult {
        val user = userService.verifyEmail(token)
            ?: throw UserNotFoundException("User not found")
        
        return EmailVerificationResult(
            user = user,
            message = "Email verified successfully"
        )
    }
    
    suspend fun requestPasswordReset(email: String): PasswordResetRequestResult {
        val success = userService.resetPassword(email)
        return PasswordResetRequestResult(
            success = success,
            message = if (success) "Password reset email sent" else "Email not found"
        )
    }
    
    suspend fun confirmPasswordReset(token: String, newPassword: String): PasswordResetResult {
        val success = userService.confirmPasswordReset(token, newPassword)
        return PasswordResetResult(
            success = success,
            message = if (success) "Password reset successfully" else "Password reset failed"
        )
    }
}

// Data classes for requests and responses
data class BusinessRegistrationRequest(
    val companyName: String,
    val companyEmail: String,
    val companyPhone: String?,
    val personalName: String,
    val personalEmail: String,
    val password: String,
    val registrationCountry: String?,
    val residenceCountry: String?,
    val biography: String?
)

data class IndividualRegistrationRequest(
    val name: String,
    val email: String,
    val phone: String?,
    val password: String,
    val nationality: String?,
    val residenceCountry: String?,
    val biography: String?
)

data class LoginResult(
    val user: User,
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long,
    val onboardingCompletedAt: LocalDateTime? = null
)

data class RegistrationResult(
    val user: User,
    val message: String
)

data class RefreshTokenResult(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long
)

data class EmailVerificationResult(
    val user: User,
    val message: String
)

data class PasswordResetRequestResult(
    val success: Boolean,
    val message: String
)

data class PasswordResetResult(
    val success: Boolean,
    val message: String
)

 