package com.pbi.api.controller

import com.pbi.api.dto.ApiResponseDTO
import com.pbi.api.dto.BoostDTO
import com.pbi.api.service.BoostService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/v1/boost")
class BoostController(
    private val boostService: BoostService
) {

    @PostMapping("/industry")
    suspend fun boostIndustry(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: BoostDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<Unit>> {
        val currentUserId = UUID.fromString(userDetails.username)
        boostService.boostIndustry(currentUserId, request.categoryId, request.planId)
        return ResponseEntity.ok(ApiResponseDTO.success(Unit, "Industry boosted successfully"))
    }

    @DeleteMapping("/industry/{categoryId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    suspend fun unBoostIndustry(
        @AuthenticationPrincipal userDetails: UserDetails,
        @PathVariable categoryId: UUID
    ): ResponseEntity<ApiResponseDTO.Success<Unit>> {
        val currentUserId = UUID.fromString(userDetails.username)
        boostService.unBoostIndustry(currentUserId, categoryId)
        return ResponseEntity.ok(ApiResponseDTO.success(Unit, "Industry un-boosted successfully"))
    }
}
