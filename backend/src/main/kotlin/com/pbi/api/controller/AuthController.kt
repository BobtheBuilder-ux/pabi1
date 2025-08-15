package com.pbi.api.controller

import com.pbi.api.config.PublicEndpoint
import com.pbi.api.dto.*
import com.pbi.api.service.AuthenticationService
import com.pbi.api.service.BusinessRegistrationRequest
import com.pbi.api.service.IndividualRegistrationRequest
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
@PublicEndpoint
class AuthController(
    private val authenticationService: AuthenticationService
) {

    @PostMapping("/login")
    suspend fun login(@Valid @RequestBody request: LoginDTO.Input): ResponseEntity<ApiResponseDTO.Success<LoginDTO.Output>> {
        val result = authenticationService.login(request.email, request.password)

        val response = LoginDTO.Output(
            accessToken = result.accessToken,
            refreshToken = result.refreshToken,
            expiresIn = result.expiresIn,
            userType = LoginDTO.Output.EUserType.valueOf(result.user.userType!!.name),
            email = result.user.email,
            onboardingCompletedAt = result.onboardingCompletedAt
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Login successful"))
    }

    @PostMapping("/register/business")
    suspend fun registerBusiness(@Valid @RequestBody request: BusinessRegistrationDTO.Input): ResponseEntity<ApiResponseDTO.Success<BusinessRegistrationDTO.Output>> {
        val businessRequest = BusinessRegistrationRequest(
            companyName = request.companyName!!,
            companyEmail = request.companyEmail!!,
            companyPhone = request.companyPhone,
            personalName = request.personalName!!,
            personalEmail = request.personalEmail!!,
            password = request.password!!,
            registrationCountry = request.registrationCountry,
            residenceCountry = request.residenceCountry,
            biography = request.biography
        )

        val result = authenticationService.registerBusinessUser(businessRequest)

        val response = BusinessRegistrationDTO.Output(
            userId = result.user.id.toString(),
            email = result.user.email,
            userType = BusinessRegistrationDTO.Output.EUserType.BUSINESS,
            message = result.message
        )

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(
                ApiResponseDTO.success(
                    response,
                    "Business user registered successfully. Please check your email to verify your account before logging in."
                )
            )
    }

    @PostMapping("/register/individual")
    suspend fun registerIndividual(@Valid @RequestBody request: IndividualRegistrationDTO.Input): ResponseEntity<ApiResponseDTO.Success<IndividualRegistrationDTO.Output>> {
        val individualRequest = IndividualRegistrationRequest(
            name = request.name!!,
            email = request.email!!,
            phone = request.phone,
            password = request.password!!,
            nationality = request.nationality,
            residenceCountry = request.residenceCountry,
            biography = request.biography
        )

        val result = authenticationService.registerIndividualUser(individualRequest)

        val response = IndividualRegistrationDTO.Output(
            userId = result.user.id.toString(),
            email = result.user.email,
            userType = IndividualRegistrationDTO.Output.EUserType.INDIVIDUAL,
            message = result.message
        )

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(
                ApiResponseDTO.success(
                    response,
                    "Individual user registered successfully. Please check your email to verify your account before logging in."
                )
            )
    }

    @PostMapping("/refresh")
    suspend fun refreshToken(@Valid @RequestBody request: RefreshTokenDTO.Input): ResponseEntity<ApiResponseDTO.Success<RefreshTokenDTO.Output>> {
        val result = authenticationService.refreshToken(request.refreshToken!!)

        val response = RefreshTokenDTO.Output(
            accessToken = result.accessToken,
            refreshToken = result.refreshToken,
            expiresIn = result.expiresIn
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Token refreshed successfully"))
    }

    @PostMapping("/verify-email")
    suspend fun verifyEmail(@RequestParam token: String): ResponseEntity<ApiResponseDTO.Success<EmailVerificationDTO.Output>> {
        val result = authenticationService.verifyEmail(token)

        val response = EmailVerificationDTO.Output(
            userId = result.user.id.toString(),
            email = result.user.email,
            message = result.message
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Email verified successfully"))
    }

    @PostMapping("/forgot-password")
    suspend fun requestPasswordReset(@Valid @RequestBody request: ForgotPasswordDTO.Input): ResponseEntity<ApiResponseDTO.Success<ForgotPasswordDTO.Output>> {
        val result = authenticationService.requestPasswordReset(request.email)

        val response = ForgotPasswordDTO.Output(
            success = result.success,
            message = result.message
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Password reset request processed"))
    }

    @PostMapping("/reset-password")
    suspend fun confirmPasswordReset(@Valid @RequestBody request: ResetPasswordDTO.Input): ResponseEntity<ApiResponseDTO.Success<ResetPasswordDTO.Output>> {
        val result = authenticationService.confirmPasswordReset(request.token, request.newPassword)

        val response = ResetPasswordDTO.Output(
            success = result.success,
            message = result.message
        )

        return ResponseEntity.ok(ApiResponseDTO.success(response, "Password reset completed"))
    }
}

 