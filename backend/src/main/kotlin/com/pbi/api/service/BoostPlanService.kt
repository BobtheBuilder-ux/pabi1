package com.pbi.api.service

import com.pbi.api.domain.BoostPlan
import com.pbi.api.dto.BoostPlanDTO
import com.pbi.api.exception.ResourceNotFoundException
import com.pbi.api.exception.ValidationException
import com.pbi.api.repository.BoostPlanRepository
import com.pbi.api.repository.UserBoostRepository
import org.springframework.stereotype.Service
import java.util.*

@Service
class BoostPlanService(
    private val boostPlanRepository: BoostPlanRepository,
    private val userBoostRepository: UserBoostRepository
) {

    suspend fun createBoostPlan(request: BoostPlanDTO.CreateBoostPlanRequest): BoostPlan {
        val newPlan = BoostPlan(
            name = request.name,
            description = request.description,
            durationDays = request.durationDays,
            priceCents = request.priceCents
        )
        return boostPlanRepository.save(newPlan)
    }

    suspend fun getBoostPlan(id: UUID): BoostPlan {
        return boostPlanRepository.findById(id)
            ?: throw ResourceNotFoundException("Boost plan not found with id: $id")
    }

    suspend fun getAllBoostPlans(): List<BoostPlan> {
        return boostPlanRepository.findAll()
    }

    suspend fun updateBoostPlan(id: UUID, request: BoostPlanDTO.UpdateBoostPlanRequest): BoostPlan {
        val existingPlan = getBoostPlan(id)
        val updatedPlan = existingPlan.copy(
            name = request.name ?: existingPlan.name,
            description = request.description ?: existingPlan.description,
            durationDays = request.durationDays ?: existingPlan.durationDays,
            priceCents = request.priceCents ?: existingPlan.priceCents,
            activatedAt = request.activatedAt ?: existingPlan.activatedAt
        )
        return boostPlanRepository.update(updatedPlan)
    }

    suspend fun deleteBoostPlan(id: UUID) {
        getBoostPlan(id) // Ensure the plan exists before deleting
        if (userBoostRepository.existsByBoostPlanId(id)) {
            throw ValidationException("Cannot delete a boost plan that is currently active for a user.")
        }
        boostPlanRepository.delete(id)
    }
}
