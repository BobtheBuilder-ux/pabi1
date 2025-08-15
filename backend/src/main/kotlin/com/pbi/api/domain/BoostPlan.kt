package com.pbi.api.domain

import java.time.LocalDateTime
import java.util.*

data class BoostPlan(
    val id: UUID = UUID(0, 0),
    val name: String,
    val description: String?,
    val durationDays: Int,
    val priceCents: Int,
    val activatedAt: LocalDateTime? = LocalDateTime.now(),
    val deletedAt: LocalDateTime? = null,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

