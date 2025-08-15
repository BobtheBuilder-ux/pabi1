package com.pbi.api.config

import com.fasterxml.jackson.databind.MapperFeature
import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.SerializationFeature
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.reactive.CorsWebFilter
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource
import org.springframework.web.reactive.config.ResourceHandlerRegistry
import org.springframework.web.reactive.config.WebFluxConfigurer


@Configuration
class WebConfig : WebFluxConfigurer {

    @Bean
    fun corsWebFilter(): CorsWebFilter {
        val configuration = CorsConfiguration()
        configuration.allowedOriginPatterns = listOf(
            "http://localhost:3000",
            "http://localhost:8080",
            "https://*.pabup.com"
        )
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
        configuration.allowedHeaders = listOf("*")
        configuration.allowCredentials = true
        configuration.maxAge = 3600L

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return CorsWebFilter(source)
    }

    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        // Serve uploaded files from the uploads directory
        registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:uploads/")
    }

    @Bean
    @Primary
    fun jackson2ObjectMapperBuilder(): Jackson2ObjectMapperBuilderCustomizer {
        return Jackson2ObjectMapperBuilderCustomizer { builder ->
            builder.propertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE)
            builder.featuresToDisable(
                MapperFeature.DEFAULT_VIEW_INCLUSION,
                SerializationFeature.WRITE_DATES_AS_TIMESTAMPS
            )
        }
    }
}