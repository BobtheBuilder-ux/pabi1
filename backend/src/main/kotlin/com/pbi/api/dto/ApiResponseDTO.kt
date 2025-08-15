package com.pbi.api.dto

import java.time.LocalDateTime

sealed class ApiResponseDTO<T> {
    data class Success<T>(
        val success: Boolean = true,
        val data: T?,
        val message: String? = null,
        val timestamp: LocalDateTime = LocalDateTime.now()
    ) : ApiResponseDTO<T>()

    data class Error<T>(
        val success: Boolean = false,
        val error: ErrorDetails,
        val timestamp: LocalDateTime = LocalDateTime.now()
    ) : ApiResponseDTO<T>() {
        data class ErrorDetails(
            val code: String,
            val message: String,
            val details: Map<String, Any>? = null
        )
    }

    companion object {
        fun <T> success(data: T? = null, message: String? = null): Success<T> {
            return Success(data = data, message = message)
        }

        fun <T> error(code: String, message: String, details: Map<String, Any>? = null): Error<T> {
            return Error(error = Error.ErrorDetails(code, message, details))
        }
    }
} 