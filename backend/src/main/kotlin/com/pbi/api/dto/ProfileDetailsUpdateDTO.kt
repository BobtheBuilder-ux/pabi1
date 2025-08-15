package com.pbi.api.dto

sealed class ProfileDetailsUpdateDTO {
    data class Input(
        var name: String? = null,
        var phone: String? = null,
        var biography: String? = null,
        var nationality: String? = null,
        var countryOfResidence: String? = null,
    ) : ProfileDetailsUpdateDTO()
}
