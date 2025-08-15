package com.pbi.api.service

import com.resend.Resend
import com.resend.core.exception.ResendException
import com.resend.services.emails.model.CreateEmailOptions
import com.resend.services.emails.model.CreateEmailResponse
import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.thymeleaf.TemplateEngine
import org.thymeleaf.context.Context

@Service
class EmailService(
    @param:Value($$"${app.email.from:no-reply@pbi.com}")
    private val fromEmail: String,

    @param:Value($$"${app.email.base-url:http://localhost:8080}")
    private val baseUrl: String,

    @param:Value($$"${app.email.resend.api-key}")
    private val resendApiKey: String,

    private val templateEngine: TemplateEngine
) {

    private val resend = Resend(resendApiKey)
    private val logger = KotlinLogging.logger {}

    // Create a coroutine scope for background email operations
    private val emailScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    /**
     * Send email verification email in the background
     */
    fun sendVerificationEmail(email: String, token: String, userName: String) {
        emailScope.launch {
            try {
                val verificationUrl = "$baseUrl/verify-account?token=$token"
                val subject = "Verify your PBI account"

                val context = Context().apply {
                    setVariable("userName", userName)
                    setVariable("verificationUrl", verificationUrl)
                    setVariable("baseUrl", baseUrl)
                }

                val content = templateEngine.process("email/verification", context)

                val params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(email)
                    .subject(subject)
                    .html(content)
                    .build()

                val response: CreateEmailResponse = resend.emails().send(params)
                logger.info { "Verification email sent successfully. Email ID: ${response.id}" }

            } catch (e: ResendException) {
                logger.error(e) { "Failed to send verification email: ${e.message}" }
                // Note: Not throwing exception since this runs in background
            } catch (e: Exception) {
                logger.error(e) { "Failed to send verification email: ${e.message}" }
            }
        }
    }

    /**
     * Send password reset email in the background
     */
    fun sendPasswordResetEmail(email: String, token: String, userName: String) {
        emailScope.launch {
            try {
                val resetUrl = "$baseUrl/reset-password?token=$token"
                val subject = "Reset your PBI password"

                val context = Context().apply {
                    setVariable("userName", userName)
                    setVariable("resetUrl", resetUrl)
                    setVariable("baseUrl", baseUrl)
                }

                val content = templateEngine.process("email/password-reset", context)

                val params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(email)
                    .subject(subject)
                    .html(content)
                    .build()

                val response: CreateEmailResponse = resend.emails().send(params)
                logger.info { "Password reset email sent successfully. Email ID: ${response.id}" }

            } catch (e: ResendException) {
                logger.error(e) { "Failed to send password reset email: ${e.message}" }
                // Note: Not throwing exception since this runs in background
            } catch (e: Exception) {
                logger.error(e) { "Failed to send password reset email: ${e.message}" }
            }
        }
    }

    /**
     * Send welcome email for new users in the background
     */
    fun sendWelcomeEmail(email: String, userName: String, userType: String) {
        emailScope.launch {
            try {
                val subject = "Welcome to PBI - Your account is ready!"

                val context = Context().apply {
                    setVariable("userName", userName)
                    setVariable("userType", userType)
                    setVariable("baseUrl", baseUrl)
                }

                val content = templateEngine.process("email/welcome", context)

                val params = CreateEmailOptions.builder()
                    .from(fromEmail)
                    .to(email)
                    .subject(subject)
                    .html(content)
                    .build()

                val response: CreateEmailResponse = resend.emails().send(params)
                logger.info { "Welcome email sent successfully. Email ID: ${response.id}" }

            } catch (e: ResendException) {
                logger.error(e) { "Failed to send welcome email: ${e.message}" }
            } catch (e: Exception) {
                logger.error(e) { "Failed to send welcome email: ${e.message}" }
            }
        }
    }

}
