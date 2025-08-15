package com.pbi.api.config

import org.springframework.core.annotation.AnnotatedElementUtils
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.reactive.result.method.annotation.RequestMappingHandlerMapping

@Component
class PublicEndpointDetector(
    private val requestMappingHandlerMapping: RequestMappingHandlerMapping
) {
    val endpoints = mutableSetOf<Pair<RequestMethod, String>>()

    /**
     * Retrieves all public endpoints defined in the application.
     * A public endpoint is determined by the presence of the `@PublicEndpoint` annotation
     * either on the method or the class level.
     *
     * @return A mutable set of pairs, where each pair consists of a `RequestMethod` and the endpoint's URL pattern.
     */
    fun getPublicEndpoints(): MutableSet<Pair<RequestMethod, String>> {

        if (endpoints.isNotEmpty()) {
            return endpoints
        }

        // Iterate over all handler methods registered in the application
        requestMappingHandlerMapping.handlerMethods.forEach { (mappingInfo, handlerMethod) ->
            // Get the class where the handler method is declared
            val clazz = handlerMethod.method.declaringClass

            // Check if the method or its declaring class is annotated with @PublicEndpoint
            val isMethodPublic = AnnotatedElementUtils.hasAnnotation(handlerMethod.method, PublicEndpoint::class.java)
            val isClassPublic = AnnotatedElementUtils.hasAnnotation(clazz, PublicEndpoint::class.java)

            // If either the method or the class is public, add its HTTP method and URL pattern to the set
            if (isMethodPublic || isClassPublic) {
                mappingInfo.methodsCondition.methods.forEach { method ->
                    mappingInfo.patternsCondition.patterns.forEach { pattern ->
                        endpoints.add(method to pattern.patternString)
                    }
                }
            }
        }

        // Return the set of public endpoints
        return endpoints
    }

    fun getSwaggerEndpoints(): Set<Pair<RequestMethod, String>> {
        return setOf(
            RequestMethod.GET to "/swagger-ui.html",
            RequestMethod.GET to "/swagger-ui/**",
            RequestMethod.GET to "/api-docs",
            RequestMethod.GET to "/api-docs/**",
            RequestMethod.GET to "/webjars/**",
            RequestMethod.GET to "/swagger-resources/**",
            RequestMethod.GET to "/v3/api-docs/**"
        )
    }

    fun getActuatorEndpoints(): Set<Pair<RequestMethod, String>> {
        return setOf(
            RequestMethod.GET to "/actuator/health",
            RequestMethod.GET to "/actuator/info"
        )
    }

    fun isPublicEndpoint(request: ServerHttpRequest): Boolean {
        val method = request.method ?: return false
        val path = request.path.toString()

        // Check if the request method and path match any public endpoint
        return endpoints.any { (requestMethod, endpointPath) ->
            requestMethod.asHttpMethod() == method && path.startsWith(endpointPath)
        } || getSwaggerEndpoints().any { (requestMethod, endpointPath) ->
            requestMethod.asHttpMethod() == method && path.startsWith(endpointPath)
        } || getActuatorEndpoints().any { (requestMethod, endpointPath) ->
            requestMethod.asHttpMethod() == method && path.startsWith(endpointPath)
        }
    }
}

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
annotation class PublicEndpoint