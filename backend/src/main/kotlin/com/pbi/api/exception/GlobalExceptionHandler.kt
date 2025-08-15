package com.pbi.api.exception

import org.springframework.boot.autoconfigure.web.WebProperties
import org.springframework.boot.autoconfigure.web.reactive.error.AbstractErrorWebExceptionHandler
import org.springframework.boot.web.error.ErrorAttributeOptions
import org.springframework.boot.web.reactive.error.ErrorAttributes
import org.springframework.context.ApplicationContext
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.codec.ServerCodecConfigurer
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.BodyInserters
import org.springframework.web.reactive.function.server.*
import org.springframework.web.reactive.resource.NoResourceFoundException
import reactor.core.publisher.Mono
import java.time.LocalDateTime

@Component
@Order(-2)
class GlobalExceptionHandler(
    errorAttributes: ErrorAttributes,
    webProperties: WebProperties,
    applicationContext: ApplicationContext,
    serverCodecConfigurer: ServerCodecConfigurer
) : AbstractErrorWebExceptionHandler(errorAttributes, webProperties.resources, applicationContext) {

    init {
        setMessageWriters(serverCodecConfigurer.writers)
    }

    override fun getRoutingFunction(errorAttributes: ErrorAttributes): RouterFunction<ServerResponse> {
        return RouterFunctions.route(RequestPredicates.all(), this::renderErrorResponse)
    }

    private fun renderErrorResponse(request: ServerRequest): Mono<ServerResponse> {
        val errorAttributes = getErrorAttributes(request, ErrorAttributeOptions.defaults())
        val error = getError(request)
        val status = getHttpStatus(error)

        val errorResponse = ErrorResponse(
            timestamp = LocalDateTime.now(),
            status = getHttpStatus(error).value(),
            error = getErrorCode(error),
            message = getErrorMessage(error, errorAttributes),
            path = request.path()
        )

        return ServerResponse.status(status)
            .contentType(MediaType.APPLICATION_JSON)
            .body(BodyInserters.fromValue(errorResponse))
    }

    private fun getHttpStatus(errorAttributes: Map<String, Any>): HttpStatus {
        val status = errorAttributes["status"] as? Int ?: 500
        return HttpStatus.valueOf(status)
    }

    private fun getErrorCode(throwable: Throwable?): String {
        return when (throwable) {
            is InvalidCredentialsException -> "INVALID_CREDENTIALS"
            is InvalidTokenException -> "INVALID_TOKEN"
            is UnauthorizedException -> "UNAUTHORIZED"
            is ForbiddenException -> "FORBIDDEN"
            is UserAlreadyExistsException -> "USER_ALREADY_EXISTS"
            is UserNotActivatedException -> "USER_NOT_ACTIVATED"
            is UserNotFoundException -> "USER_NOT_FOUND"
            is ValidationException -> "VALIDATION_ERROR"
            is InvalidInputException -> "INVALID_INPUT"
            is BusinessRuleException -> "BUSINESS_RULE_VIOLATION"
            is ResourceNotFoundException -> "RESOURCE_NOT_FOUND"
            is ResourceConflictException -> "RESOURCE_CONFLICT"
            is ExternalServiceException -> "EXTERNAL_SERVICE_ERROR"
            is EmailServiceException -> "EMAIL_SERVICE_ERROR"
            is FileUploadException -> "FILE_UPLOAD_ERROR"
            is TokenNotFoundException -> "TOKEN_NOT_FOUND"
            is org.springframework.web.bind.support.WebExchangeBindException -> "VALIDATION_ERROR"
            is org.springframework.web.server.ServerWebInputException -> "INVALID_INPUT"
            is NoResourceFoundException -> "RESOURCE_NOT_FOUND"
            else -> "INTERNAL_SERVER_ERROR"
        }
    }

    private fun getErrorMessage(throwable: Throwable?, errorAttributes: Map<String, Any>): String {
        return when (throwable) {
            is ApplicationException -> throwable.message ?: "Application error occurred"
            is org.springframework.web.bind.support.WebExchangeBindException -> {
                val errors = throwable.bindingResult.fieldErrors.map { "${it.field}: ${it.defaultMessage}" }
                "Validation failed: ${errors.joinToString(", ")}"
            }

            is org.springframework.web.server.ServerWebInputException -> {
                throwable.message ?: "Invalid input"
            }

            else -> {
                errorAttributes["message"] as? String ?: "An unexpected error occurred"
            }
        }
    }

    private fun getHttpStatus(throwable: Throwable?): HttpStatus {
        return when (throwable) {
            is InvalidCredentialsException -> HttpStatus.UNAUTHORIZED
            is InvalidTokenException -> HttpStatus.UNAUTHORIZED
            is UnauthorizedException -> HttpStatus.UNAUTHORIZED
            is ForbiddenException -> HttpStatus.FORBIDDEN
            is UserAlreadyExistsException -> HttpStatus.CONFLICT
            is UserNotActivatedException -> HttpStatus.FORBIDDEN
            is UserNotFoundException -> HttpStatus.NOT_FOUND
            is ValidationException -> HttpStatus.BAD_REQUEST
            is InvalidInputException -> HttpStatus.BAD_REQUEST
            is BusinessRuleException -> HttpStatus.BAD_REQUEST
            is ResourceNotFoundException -> HttpStatus.NOT_FOUND
            is ResourceConflictException -> HttpStatus.CONFLICT
            is ExternalServiceException -> HttpStatus.SERVICE_UNAVAILABLE
            is EmailServiceException -> HttpStatus.SERVICE_UNAVAILABLE
            is FileUploadException -> HttpStatus.BAD_REQUEST
            is TokenNotFoundException -> HttpStatus.NOT_FOUND
            is org.springframework.web.bind.support.WebExchangeBindException -> HttpStatus.BAD_REQUEST
            is org.springframework.web.server.ServerWebInputException -> HttpStatus.BAD_REQUEST
            is NoResourceFoundException -> HttpStatus.NOT_FOUND
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }
    }

    data class ErrorResponse(
        val timestamp: LocalDateTime,
        val status: Int,
        val error: String,
        val message: String,
        val path: String?
    )
} 