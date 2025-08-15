package com.pbi.api.security.jwt

import com.pbi.api.config.PublicEndpointDetector
import org.springframework.http.HttpHeaders
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.security.core.context.ReactiveSecurityContextHolder
import org.springframework.util.StringUtils
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

class JwtTokenAuthenticationFilter(
    private val tokenProvider: JwtTokenProvider,
    private val publicEndpointDetector: PublicEndpointDetector
) : WebFilter {

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void?> {
        val token = resolveToken(exchange.request)
        if (!token.isNullOrBlank()) {
            if (tokenProvider.validateToken(token)) {
                val authentication = tokenProvider.getAuthentication(token)
                return chain.filter(exchange)
                    .contextWrite { ReactiveSecurityContextHolder.withAuthentication(authentication) }
            } else if (publicEndpointDetector.isPublicEndpoint(exchange.request)) {
                return chain.filter(exchange)
            }
        }
        return chain.filter(exchange)
    }

    private fun resolveToken(request: ServerHttpRequest): String? {
        val bearerToken = request.headers.getFirst(HttpHeaders.AUTHORIZATION)
        if (StringUtils.hasText(bearerToken) && bearerToken!!.startsWith(HEADER_PREFIX)) {
            return bearerToken.substring(7)
        }
        return null
    }

    companion object {
        const val HEADER_PREFIX: String = "Bearer "
    }
}