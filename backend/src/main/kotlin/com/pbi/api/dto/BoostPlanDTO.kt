package com.pbi.api.dto

import java.time.LocalDateTime
import java.util.*

class BoostPlanDTO {
    data class CreateBoostPlanRequest(
        val name: String,
        val description: String?,
        val durationDays: Int,
        val priceCents: Int
    )

    data class UpdateBoostPlanRequest(
        val name: String?,
        val description: String?,
        val durationDays: Int?,
        val priceCents: Int?,
        val activatedAt: LocalDateTime?
    )

    data class BoostPlanResponse(
        val id: UUID,
        val name: String,
        val description: String?,
        val durationDays: Int,
        val priceCents: Int,
    )
}

