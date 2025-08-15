package com.pbi.api.repository

import com.pbi.generated.tables.UserBoosts.Companion.USER_BOOSTS
import kotlinx.coroutines.reactive.awaitFirst
import org.jooq.DSLContext
import org.springframework.stereotype.Repository
import java.util.*

interface UserBoostRepository {
    suspend fun existsByBoostPlanId(boostPlanId: UUID): Boolean
}

@Repository
class JooqUserBoostRepository(
    private val dsl: DSLContext
) : UserBoostRepository {
    override suspend fun existsByBoostPlanId(boostPlanId: UUID): Boolean {
        return dsl.selectCount()
            .from(USER_BOOSTS)
            .where(USER_BOOSTS.BOOST_PLAN_ID.eq(boostPlanId))
            .and(USER_BOOSTS.DELETED_AT.isNull)
            .and(USER_BOOSTS.IS_ACTIVE.isTrue)
            .awaitFirst()
            .value1() > 0
    }
}

