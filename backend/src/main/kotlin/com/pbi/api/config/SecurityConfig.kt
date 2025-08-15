package com.pbi.api.config

import com.pbi.api.repository.UserRepository
import com.pbi.api.security.jwt.JwtTokenAuthenticationFilter
import com.pbi.api.security.jwt.JwtTokenProvider
import kotlinx.coroutines.reactor.mono
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.ReactiveAuthenticationManager
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.core.userdetails.ReactiveUserDetailsService
import org.springframework.security.core.userdetails.User
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.server.SecurityWebFilterChain
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers
import reactor.core.publisher.Mono


@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
class SecurityConfig(
    private val publicEndpointDetector: PublicEndpointDetector
) {

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun securityWebFilterChain(http: ServerHttpSecurity, tokenProvider: JwtTokenProvider): SecurityWebFilterChain {
        val publicEndpoints = publicEndpointDetector.getPublicEndpoints()
        val swaggerEndpoints = publicEndpointDetector.getSwaggerEndpoints()
        val actuatorEndpoints = publicEndpointDetector.getActuatorEndpoints()

        val allPublicEndpoints = (publicEndpoints + swaggerEndpoints + actuatorEndpoints).toTypedArray()

        return http
            .csrf { it.disable() }
            .httpBasic { it.disable() }
            .authorizeExchange { exchanges ->
                val publicMatchers: Array<ServerWebExchangeMatcher?> = allPublicEndpoints.map {
                    val (method, path) = it
                    ServerWebExchangeMatchers.pathMatchers(method.asHttpMethod(), path)
                }.toTypedArray()

                exchanges
                    // Allow all public endpoints detected by annotation
                    .matchers(*publicMatchers).permitAll()
                    .pathMatchers(HttpMethod.OPTIONS).permitAll() // Allow CORS preflight requests
                    // Admin endpoints
                    .pathMatchers("/api/v1/admin/**").hasRole("ADMIN")
                    // All other endpoints require authentication
                    .anyExchange().authenticated()
            }
            .addFilterAt(
                JwtTokenAuthenticationFilter(tokenProvider, publicEndpointDetector),
                SecurityWebFiltersOrder.HTTP_BASIC
            )
            .exceptionHandling { it.authenticationEntryPoint(HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED)) }
            .build()
    }

    @Bean
    fun userDetailsService(users: UserRepository): ReactiveUserDetailsService {
        return ReactiveUserDetailsService { username: String? ->
            username ?: return@ReactiveUserDetailsService Mono.empty()

            mono {
                val domainUser = users.findByEmail(username) ?: return@mono null
                User.withUsername(domainUser.email)
                    .password(domainUser.passwordHash)
                    .roles(*domainUser.roles.toTypedArray())
                    .authorities(*domainUser.permissions.toTypedArray())
                    .accountExpired(domainUser.activatedAt == null)
                    .credentialsExpired(domainUser.activatedAt == null)
                    .disabled(domainUser.activatedAt == null)
                    .accountLocked(domainUser.activatedAt == null)
                    .build()
            }
        }
    }

    @Bean
    fun reactiveAuthenticationManager(
        userDetailsService: ReactiveUserDetailsService,
        passwordEncoder: PasswordEncoder?
    ): ReactiveAuthenticationManager {
        val authenticationManager = UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService)
        authenticationManager.setPasswordEncoder(passwordEncoder)
        return authenticationManager
    }
} 