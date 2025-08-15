package com.pbi.api.dto

import jakarta.validation.constraints.NotNull
import java.util.*

sealed class BoostDTO {
    data class Input(
        @field:NotNull(message = "Category ID cannot be null")
        val categoryId: UUID,

        @field:NotNull(message = "Boost plan ID cannot be null")
        val planId: UUID
    ) : BoostDTO()

    data class Output(
        val userId: UUID,
        val categoryId: UUID,
        val boostedAt: String,
        val expiresAt: String
    ) : BoostDTO()
}

