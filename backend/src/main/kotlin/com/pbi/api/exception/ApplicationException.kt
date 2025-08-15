package com.pbi.api.exception

/**
 * Base exception class for all application-specific exceptions
 */
abstract class ApplicationException(
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)

/**
 * Authentication and authorization related exceptions
 */
class InvalidCredentialsException(message: String) : ApplicationException(message)
class InvalidTokenException(message: String) : ApplicationException(message)
class UnauthorizedException(message: String) : ApplicationException(message)
class ForbiddenException(message: String) : ApplicationException(message)

/**
 * User management related exceptions
 */
class UserAlreadyExistsException(message: String) : ApplicationException(message)
class UserNotActivatedException(message: String) : ApplicationException(message)
class UserAlreadyActivatedException(message: String) : ApplicationException(message)
class UserNotFoundException(message: String) : ApplicationException(message)

/**
 * Validation related exceptions
 */
class ValidationException(message: String) : ApplicationException(message)
class InvalidInputException(message: String) : ApplicationException(message)

/**
 * Business logic related exceptions
 */
class BusinessRuleException(message: String) : ApplicationException(message)
class ResourceNotFoundException(message: String) : ApplicationException(message)
class ResourceConflictException(message: String) : ApplicationException(message)

/**
 * External service related exceptions
 */
class ExternalServiceException(message: String, cause: Throwable? = null) : ApplicationException(message, cause)
class EmailServiceException(message: String, cause: Throwable? = null) : ApplicationException(message, cause)

/**
 * Token management related exceptions
 */
class TokenExpiredException(message: String) : ApplicationException(message)
class TokenNotFoundException(message: String) : ApplicationException(message)
class InvalidTokenFormatException(message: String) : ApplicationException(message)

/**
 * File upload related exceptions
 */
class FileUploadException(message: String, cause: Throwable? = null) : ApplicationException(message, cause) 