package com.pbi.api.security.jwt

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties(prefix = "jwt")
data class JwtConfig(
    var secret: String = "your-secret-key-change-this-in-production-make-it-at-least-256-bits-long",
    var expiration: Long = 86400000, // 24 hours in milliseconds
    var refreshExpiration: Long = 2592000000, // 30 days in milliseconds
    var issuer: String = "pbi-api"
) 