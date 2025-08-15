package com.pbi.api.service

import com.pbi.api.exception.InvalidTokenException
import com.pbi.api.exception.TokenExpiredException
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec
import java.security.SecureRandom
import java.util.Base64

@Service
class TokenService {
    
    private val secureRandom = SecureRandom()
    private val tokenExpirationHours = 24L // 24 hours for verification tokens
    private val resetTokenExpirationHours = 1L // 1 hour for password reset tokens
    
    /**
     * Generate a secure verification token for email verification
     */
    fun generateVerificationToken(): String {
        return generateSecureToken()
    }
    
    /**
     * Generate a secure password reset token
     */
    fun generatePasswordResetToken(): String {
        return generateSecureToken()
    }
    
    /**
     * Generate a secure token with proper entropy
     */
    private fun generateSecureToken(): String {
        val bytes = ByteArray(32) // 256 bits
        secureRandom.nextBytes(bytes)
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
    }
    
    /**
     * Validate token expiration
     */
    fun isTokenExpired(createdAt: LocalDateTime, expirationHours: Long): Boolean {
        val expirationTime = createdAt.plusHours(expirationHours)
        return LocalDateTime.now().isAfter(expirationTime)
    }
    
    /**
     * Get verification token expiration time
     */
    fun getVerificationTokenExpiration(): LocalDateTime {
        return LocalDateTime.now().plusHours(tokenExpirationHours)
    }
    
    /**
     * Get password reset token expiration time
     */
    fun getPasswordResetTokenExpiration(): LocalDateTime {
        return LocalDateTime.now().plusHours(resetTokenExpirationHours)
    }
    
    /**
     * Validate verification token expiration
     */
    fun isVerificationTokenExpired(createdAt: LocalDateTime): Boolean {
        return isTokenExpired(createdAt, tokenExpirationHours)
    }
    
    /**
     * Validate password reset token expiration
     */
    fun isPasswordResetTokenExpired(createdAt: LocalDateTime): Boolean {
        return isTokenExpired(createdAt, resetTokenExpirationHours)
    }
} 