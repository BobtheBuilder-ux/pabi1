package com.pbi.api.controller

import com.pbi.api.config.PublicEndpoint
import com.pbi.api.dto.ApiResponseDTO
import com.pbi.api.dto.BoostPlanDTO
import com.pbi.api.service.BoostPlanService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/v1/boost-plans")
class BoostPlanController(
    private val boostPlanService: BoostPlanService
) {

    @PostMapping
    suspend fun createBoostPlan(
        @Valid @RequestBody request: BoostPlanDTO.CreateBoostPlanRequest
    ): ResponseEntity<ApiResponseDTO.Success<BoostPlanDTO.BoostPlanResponse>> {
        val newPlan = boostPlanService.createBoostPlan(request)
        val response = BoostPlanDTO.BoostPlanResponse(
            id = newPlan.id,
            name = newPlan.name,
            description = newPlan.description,
            durationDays = newPlan.durationDays,
            priceCents = newPlan.priceCents,
        )
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponseDTO.success(response, "Boost plan created successfully"))
    }

    @GetMapping("/{id}")
    @PublicEndpoint
    suspend fun getBoostPlan(@PathVariable id: UUID): ResponseEntity<ApiResponseDTO.Success<BoostPlanDTO.BoostPlanResponse>> {
        val plan = boostPlanService.getBoostPlan(id)
        val response = BoostPlanDTO.BoostPlanResponse(
            id = plan.id,
            name = plan.name,
            description = plan.description,
            durationDays = plan.durationDays,
            priceCents = plan.priceCents,
        )
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Boost plan retrieved successfully"))
    }

    @GetMapping
    @PublicEndpoint
    suspend fun getAllBoostPlans(): ResponseEntity<ApiResponseDTO.Success<List<BoostPlanDTO.BoostPlanResponse>>> {
        val plans = boostPlanService.getAllBoostPlans()
        val response = plans.map { plan ->
            BoostPlanDTO.BoostPlanResponse(
                id = plan.id,
                name = plan.name,
                description = plan.description,
                durationDays = plan.durationDays,
                priceCents = plan.priceCents,
            )
        }
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Boost plans retrieved successfully"))
    }

    @PutMapping("/{id}")
    suspend fun updateBoostPlan(
        @PathVariable id: UUID,
        @Valid @RequestBody request: BoostPlanDTO.UpdateBoostPlanRequest
    ): ResponseEntity<ApiResponseDTO.Success<BoostPlanDTO.BoostPlanResponse>> {
        val updatedPlan = boostPlanService.updateBoostPlan(id, request)
        val response = BoostPlanDTO.BoostPlanResponse(
            id = updatedPlan.id,
            name = updatedPlan.name,
            description = updatedPlan.description,
            durationDays = updatedPlan.durationDays,
            priceCents = updatedPlan.priceCents,
        )
        return ResponseEntity.ok(ApiResponseDTO.success(response, "Boost plan updated successfully"))
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    suspend fun deleteBoostPlan(@PathVariable id: UUID): ResponseEntity<ApiResponseDTO.Success<Unit>> {
        boostPlanService.deleteBoostPlan(id)
        return ResponseEntity.ok(ApiResponseDTO.success(Unit, "Boost plan deleted successfully"))
    }
}

