package com.pbi.api.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.PathItem
import io.swagger.v3.oas.models.info.Contact
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.info.License
import io.swagger.v3.oas.models.security.SecurityRequirement
import io.swagger.v3.oas.models.security.SecurityScheme
import org.springdoc.core.customizers.GlobalOpenApiCustomizer
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.bind.annotation.RequestMethod

@Configuration
class SwaggerConfig(private val publicEndpointDetector: PublicEndpointDetector) {

    @Value("\${server.port:8080}")
    private val serverPort: String = "8080"

    @Value("\${app.frontend-url:http://localhost:3000}")
    private val frontendUrl: String = "http://localhost:3000"

    @Bean
    fun openAPI(): OpenAPI = OpenAPI()
        .info(
            Info()
                .title("PBI Business Matching Platform API")
                .description(
                    """
                            A modern, reactive Spring Boot API built with Kotlin, implementing hexagonal architecture 
                            and using suspend functions for asynchronous operations.
        
                            **Protected Endpoints** require JWT token in the Authorization header:
                            ```
                            Authorization: Bearer <your-jwt-token>
                            ```
                            Get your token by calling the `/api/v1/auth/login` endpoint.
                            """.trimIndent()
                )
                .version("1.0.0")
                .contact(Contact().apply {
                    name = "PBI Development Team"
                    email = "dev@pbi.com"
                    url = "https://pbi.com"
                })
                .license(License().apply {
                    name = "MIT License"
                    url = "https://opensource.org/licenses/MIT"
                })
        )
        .addSecurityItem(SecurityRequirement().addList("Bearer Authentication"))
        .schemaRequirement(
            "Bearer Authentication",
            SecurityScheme().apply {
                name = "Bearer Authentication"
                type = SecurityScheme.Type.HTTP
                scheme = "bearer"
                bearerFormat = "JWT"
                description = "JWT token obtained from /api/v1/auth/login"
            }
        )

    @Bean
    fun globalOpenApiCustomizer(): GlobalOpenApiCustomizer = GlobalOpenApiCustomizer { openApi ->
        val publicEndpoints = publicEndpointDetector.getPublicEndpoints()
        openApi.paths?.forEach { (path, pathItem) ->
            val readOperationsMap = pathItem.readOperationsMap()
            val isPublicPath = publicEndpoints.any { (method, publicPathString) ->
                val pathMatch = path == publicPathString
                val methodFound = method.asPathItemHttpMethod() in readOperationsMap.keys
                pathMatch && methodFound
            }
            if (isPublicPath) {
                readOperationsMap.values.forEach { it.security = emptyList() }
            }
        }
    }

    private fun RequestMethod.asPathItemHttpMethod(): PathItem.HttpMethod =
        PathItem.HttpMethod.valueOf(this.name)
}