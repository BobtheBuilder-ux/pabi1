package com.pbi.api.controller

import com.pbi.api.config.PublicEndpoint
import com.pbi.api.dto.ApiResponseDTO
import com.pbi.api.dto.SearchDTO
import com.pbi.api.service.SearchService
import jakarta.validation.Valid
import org.springdoc.core.annotations.ParameterObject
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/api/v1/search")
class SearchController(
    private val searchService: SearchService
) {

    @GetMapping("/boosted")
    suspend fun searchBoostedUsers(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @ParameterObject request: SearchDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<SearchDTO.Output>> {
        val currentUserId = UUID.fromString(userDetails.username)

        val result = searchService.searchBoostedUsers(
            currentUserId = currentUserId,
            q = request.q,
            country = request.country,
            categories = request.categoryIds,
            hasConnection = request.hasConnection,
            cursor = request.cursor,
            size = request.size ?: 20
        )

        return ResponseEntity.ok(ApiResponseDTO.success(result, "Boosted search completed successfully"))
    }

    @GetMapping
    @PublicEndpoint
    suspend fun searchUsers(
        @AuthenticationPrincipal userDetails: UserDetails?,
        @Valid @ParameterObject request: SearchDTO.Input
    ): ResponseEntity<ApiResponseDTO.Success<SearchDTO.Output>> {
        val currentUserId = userDetails?.username?.let { UUID.fromString(it) }

        val result = searchService.searchUsers(
            currentUserId = currentUserId,
            q = request.q,
            country = request.country,
            categories = request.categoryIds,
            hasConnection = request.hasConnection,
            cursor = request.cursor,
            size = request.size ?: 20,
            sort = request.sort ?: SearchDTO.Input.ESortOrder.RECENT
        )

        return ResponseEntity.ok(ApiResponseDTO.success(result, "Search completed successfully"))
    }
}
