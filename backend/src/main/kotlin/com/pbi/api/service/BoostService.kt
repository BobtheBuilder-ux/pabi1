package com.pbi.api.service

import com.pbi.api.exception.ResourceNotFoundException
import com.pbi.api.exception.ValidationException
import com.pbi.api.repository.BoostPlanRepository
import com.pbi.api.repository.UserRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class BoostService(
    private val userRepository: UserRepository,
    private val boostPlanRepository: BoostPlanRepository
) {

    suspend fun boostIndustry(userId: UUID, categoryId: UUID, planId: UUID) {
        val plan = boostPlanRepository.findById(planId)
            ?: throw ResourceNotFoundException("Boost plan not found")

        val userIndustries = userRepository.findAllUserIndustries(userId)
        if (userIndustries.none { it.id == categoryId }) {
            throw ValidationException("User does not have this industry")
        }

        val expiresAt = LocalDateTime.now().plusDays(plan.durationDays.toLong())

        userRepository.boostIndustry(userId, categoryId, expiresAt)
    }

    suspend fun unBoostIndustry(userId: UUID, categoryId: UUID) {
        val userIndustries = userRepository.findAllUserIndustriesWithBoostStatus(userId)
        val industryToUnboost = userIndustries.find { it.id == categoryId }
            ?: throw ValidationException("User does not have this industry")

        if (!industryToUnboost.isBoosted) {
            throw ValidationException("Industry is not boosted")
        }

        userRepository.unboostIndustry(userId, categoryId)
    }
}
