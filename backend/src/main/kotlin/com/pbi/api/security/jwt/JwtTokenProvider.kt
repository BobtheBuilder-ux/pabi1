package com.pbi.api.security.jwt

import com.pbi.api.exception.InvalidTokenException
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import io.netty.handler.codec.base64.Base64Encoder
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.core.userdetails.User
import org.springframework.stereotype.Component
import java.util.*
import java.util.function.Function
import javax.crypto.SecretKey


@Component
class JwtTokenProvider(private val jwtConfig: JwtConfig) {

    private fun getSigningKey(): SecretKey {
        return Keys.hmacShaKeyFor(jwtConfig.secret.toByteArray())
    }

    fun generateToken(
        userId: UUID,
        email: String,
        userType: String,
        roles: Set<String> = emptySet(),
        permissions: Set<String> = emptySet()
    ): String {
        val extraClaims = mapOf(
            "email" to email,
            "userType" to userType,
            "roles" to roles,
            "permissions" to permissions
        )
        return buildToken(extraClaims, userId.toString(), jwtConfig.expiration)
    }

    fun generateRefreshToken(userId: UUID): String {
        val extraClaims = mapOf("type" to "refresh")
        return buildToken(extraClaims, userId.toString(), jwtConfig.refreshExpiration)
    }

    private fun buildToken(extraClaims: Map<String, Any>, subject: String, expiration: Long): String {
        val exp = Date(System.currentTimeMillis() + expiration)
        return Jwts.builder()
            .claims().add(extraClaims)
            .subject(subject)
            .issuer(jwtConfig.issuer)
            .issuedAt(Date(System.currentTimeMillis()))
            .expiration(exp).and()
            .signWith(getSigningKey(), Jwts.SIG.HS512)
            .compact()
    }

    fun validateToken(token: String): Boolean {
        return !isTokenExpired(token)
    }

    fun extractUserId(token: String): UUID {
        val subject = extractClaim(token, Claims::getSubject)
        return UUID.fromString(subject)
    }

    fun extractEmail(token: String): String {
        return extractClaim(token) { claims ->
            claims["email"] as? String ?: throw InvalidTokenException("Email claim not found in token")
        }
    }

    fun extractUserType(token: String): String {
        return extractClaim(token) { claims ->
            claims["userType"] as? String ?: throw InvalidTokenException("User type claim not found in token")
        }
    }

    fun extractRoles(token: String): Set<String> {
        return extractClaim(token) { claims ->
            @Suppress("UNCHECKED_CAST")
            (claims["roles"] as? Set<String>) ?: emptySet()
        }
    }

    fun extractPermissions(token: String): Set<String> {
        return extractClaim(token) { claims ->
            @Suppress("UNCHECKED_CAST")
            (claims["permissions"] as? Set<String>) ?: emptySet()
        }
    }

    fun isTokenExpired(token: String): Boolean {
        return extractExpiration(token).before(Date())
    }

    fun isRefreshToken(token: String): Boolean {
        return extractClaim(token) { claims ->
            claims["type"] as? String == "refresh"
        }
    }

    fun getTokenExpirationDate(token: String): Date {
        return extractExpiration(token)
    }

    private fun <T> extractClaim(token: String, claimsResolver: Function<Claims, T>): T {
        val claims = extractAllClaims(token)
        return claimsResolver.apply(claims)
    }

    private fun <T> extractClaim(token: String, claimsResolver: (Claims) -> T): T {
        val claims = extractAllClaims(token)
        return claimsResolver(claims)
    }

    private fun extractExpiration(token: String): Date {
        return extractClaim(token, Claims::getExpiration)
    }

    private fun extractAllClaims(token: String): Claims {
        return try {
            Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .payload
        } catch (e: Exception) {
            throw InvalidTokenException("Invalid token: ${e.message}")
        }
    }

    @Suppress("UNCHECKED_CAST")
    fun getAuthentication(token: String): Authentication? {
        val claims = extractAllClaims(token)
        if (claims.isEmpty()) {
            return null
        }
        val roles = claims["roles"] as? List<String> ?: emptyList()
        val permissions = claims["permissions"] as? List<String> ?: emptySet()
        val username = claims.subject

        val authorities =
            if (roles.isEmpty()) AuthorityUtils.NO_AUTHORITIES
            else AuthorityUtils.commaSeparatedStringToAuthorityList(roles.joinToString(","))

        if (authorities.isNotEmpty()) {
            authorities.addAll(AuthorityUtils.commaSeparatedStringToAuthorityList(permissions.joinToString(",")))
        }

        val principal = User(username, "", authorities)
        return UsernamePasswordAuthenticationToken(principal, token, authorities)
    }

    data class TokenPair(
        val accessToken: String,
        val refreshToken: String,
        val expiresIn: Long
    )

    fun generateTokenPair(
        userId: UUID,
        email: String,
        userType: String,
        roles: Set<String> = emptySet(),
        permissions: Set<String> = emptySet()
    ): TokenPair {
        val accessToken = generateToken(userId, email, userType, roles, permissions)
        val refreshToken = generateRefreshToken(userId)

        return TokenPair(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = jwtConfig.expiration / 1000
        )
    }
} 