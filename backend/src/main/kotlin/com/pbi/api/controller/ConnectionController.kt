package com.pbi.api.controller

import com.pbi.api.dto.ApiResponseDTO
import com.pbi.api.dto.ConnectionDTO
import com.pbi.api.service.ConnectionService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springdoc.core.annotations.ParameterObject
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.web.bind.annotation.*
import java.util.*

@RestController
@RequestMapping("/api/v1/connections")
@Tag(name = "Connection Management", description = "APIs for managing user connections and connection requests")
class ConnectionController(
    private val connectionService: ConnectionService
) {

    @PostMapping("/requests")
    @Operation(
        summary = "Send connection request",
        description = "Send a connection request to another user"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "201", description = "Connection request sent successfully"),
            ApiResponse(responseCode = "400", description = "Invalid request or validation error"),
            ApiResponse(responseCode = "404", description = "Recipient not found"),
            ApiResponse(responseCode = "409", description = "Connection request already exists")
        ]
    )
    suspend fun sendConnectionRequest(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @RequestBody request: ConnectionDTO.SendRequestInput
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.ConnectionRequestOutput>> {
        val userId = UUID.fromString(userDetails.username)
        val result = connectionService.sendConnectionRequest(userId, request)

        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponseDTO.Success(
                data = result,
                message = "Connection request sent successfully"
            )
        )
    }

    @GetMapping("/requests/received")
    @Operation(
        summary = "Get received connection requests",
        description = "Get connection requests received by the current user with cursor pagination"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Received requests retrieved successfully")
        ]
    )
    suspend fun getReceivedRequests(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @ParameterObject request: ConnectionDTO.ConnectionListInput
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.ConnectionListOutput>> {
        val userId = UUID.fromString(userDetails.username)
        val result = connectionService.getReceivedRequests(userId, request)

        return ResponseEntity.ok(
            ApiResponseDTO.Success(
                data = result,
                message = "Received requests retrieved successfully"
            )
        )
    }

    @GetMapping("/requests/sent")
    @Operation(
        summary = "Get sent connection requests",
        description = "Get connection requests sent by the current user with cursor pagination"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Sent requests retrieved successfully")
        ]
    )
    suspend fun getSentRequests(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @ParameterObject request: ConnectionDTO.ConnectionListInput
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.ConnectionListOutput>> {
        val userId = UUID.fromString(userDetails.username)
        val result = connectionService.getSentRequests(userId, request)

        return ResponseEntity.ok(
            ApiResponseDTO.Success(
                data = result,
                message = "Sent requests retrieved successfully"
            )
        )
    }

    @PatchMapping("/requests/{requestId}/accept")
    @Operation(
        summary = "Accept connection request",
        description = "Accept a connection request received by the current user"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Connection request accepted successfully"),
            ApiResponse(responseCode = "404", description = "Connection request not found"),
            ApiResponse(responseCode = "400", description = "Request cannot be accepted")
        ]
    )
    suspend fun acceptConnectionRequest(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Parameter(description = "Connection request ID") @PathVariable requestId: String
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.ConnectionRequestOutput>> {
        val userId = UUID.fromString(userDetails.username)
        val requestUuid = UUID.fromString(requestId)
        val result = connectionService.acceptConnectionRequest(userId, requestUuid)

        return ResponseEntity.ok(
            ApiResponseDTO.Success(
                data = result,
                message = "Connection request accepted successfully"
            )
        )
    }

    @PatchMapping("/requests/{requestId}/reject")
    @Operation(
        summary = "Reject connection request",
        description = "Reject a connection request received by the current user"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Connection request rejected successfully"),
            ApiResponse(responseCode = "404", description = "Connection request not found"),
            ApiResponse(responseCode = "400", description = "Request cannot be rejected")
        ]
    )
    suspend fun rejectConnectionRequest(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Parameter(description = "Connection request ID") @PathVariable requestId: String
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.ConnectionRequestOutput>> {
        val userId = UUID.fromString(userDetails.username)
        val requestUuid = UUID.fromString(requestId)
        val result = connectionService.rejectConnectionRequest(userId, requestUuid)

        return ResponseEntity.ok(
            ApiResponseDTO.Success(
                data = result,
                message = "Connection request rejected successfully"
            )
        )
    }

    @DeleteMapping("/requests/{requestId}")
    @Operation(
        summary = "Cancel connection request",
        description = "Cancel a connection request sent by the current user"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Connection request cancelled successfully"),
            ApiResponse(responseCode = "404", description = "Connection request not found"),
            ApiResponse(responseCode = "400", description = "Request cannot be cancelled")
        ]
    )
    suspend fun cancelConnectionRequest(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Parameter(description = "Connection request ID") @PathVariable requestId: String
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.ConnectionRequestOutput>> {
        val userId = UUID.fromString(userDetails.username)
        val requestUuid = UUID.fromString(requestId)
        val result = connectionService.cancelConnectionRequest(userId, requestUuid)

        return ResponseEntity.ok(
            ApiResponseDTO.Success(
                data = result,
                message = "Connection request cancelled successfully"
            )
        )
    }

    @GetMapping
    @Operation(
        summary = "Get user connections",
        description = "Get all accepted connections for the current user with cursor pagination"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Connections retrieved successfully")
        ]
    )
    suspend fun getConnections(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Valid @ParameterObject request: ConnectionDTO.ConnectionListInput
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.ConnectionOutput>> {
        val userId = UUID.fromString(userDetails.username)
        val result = connectionService.getConnections(userId, request)

        return ResponseEntity.ok(
            ApiResponseDTO.Success(
                data = result,
                message = "Connections retrieved successfully"
            )
        )
    }

    @DeleteMapping("/{connectionId}")
    @Operation(
        summary = "Remove connection",
        description = "Remove an existing connection between users"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "204", description = "Connection removed successfully"),
            ApiResponse(responseCode = "404", description = "Connection not found")
        ]
    )
    suspend fun removeConnection(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Parameter(description = "Connection ID") @PathVariable connectionId: String
    ): ResponseEntity<Void> {
        val userId = UUID.fromString(userDetails.username)
        val connectionUuid = UUID.fromString(connectionId)
        connectionService.removeConnection(userId, connectionUuid)

        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{connectionId}/profile")
    @Operation(
        summary = "Get connection profile",
        description = "Get the profile information of a connected user"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Connection profile retrieved successfully"),
            ApiResponse(responseCode = "404", description = "Connection not found")
        ]
    )
    suspend fun getConnectionProfile(
        @AuthenticationPrincipal userDetails: UserDetails,
        @Parameter(description = "Connection ID") @PathVariable connectionId: String
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.UserInfo>> {
        val userId = UUID.fromString(userDetails.username)
        val connectionUuid = UUID.fromString(connectionId)

        // Get the connection to find the other user
        val connection = connectionService.getConnections(
            userId,
            ConnectionDTO.ConnectionListInput(size = 50)
        )

        val connectedUser = connection.connections.find { it.id == connectionId }
            ?: throw RuntimeException("Connection not found")

        return ResponseEntity.ok(
            ApiResponseDTO.Success(
                data = connectedUser,
                message = "Connection profile retrieved successfully"
            )
        )
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Get connection statistics",
        description = "Get connection statistics for the current user"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Connection statistics retrieved successfully")
        ]
    )
    suspend fun getConnectionStats(
        @AuthenticationPrincipal userDetails: UserDetails
    ): ResponseEntity<ApiResponseDTO.Success<ConnectionDTO.ConnectionStatsOutput>> {
        val userId = UUID.fromString(userDetails.username)
        val result = connectionService.getConnectionStats(userId)

        return ResponseEntity.ok(
            ApiResponseDTO.Success(
                data = result,
                message = "Connection statistics retrieved successfully"
            )
        )
    }
}
