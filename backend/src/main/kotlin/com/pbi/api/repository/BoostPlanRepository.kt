package com.pbi.api.repository

import com.pbi.api.config.awaitList
import com.pbi.api.domain.BoostPlan
import com.pbi.generated.tables.BoostPlans.Companion.BOOST_PLANS
import kotlinx.coroutines.reactive.awaitFirst
import kotlinx.coroutines.reactive.awaitFirstOrNull
import org.jooq.DSLContext
import org.jooq.Record
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

interface BoostPlanRepository {
    suspend fun findById(id: UUID): BoostPlan?
    suspend fun findAll(): List<BoostPlan>
    suspend fun save(plan: BoostPlan): BoostPlan
    suspend fun update(plan: BoostPlan): BoostPlan
    suspend fun delete(id: UUID)
}

@Repository
class JooqBoostPlanRepository(
    private val dsl: DSLContext
) : BoostPlanRepository {

    override suspend fun findById(id: UUID): BoostPlan? {
        return dsl.selectFrom(BOOST_PLANS)
            .where(BOOST_PLANS.ID.eq(id))
            .and(BOOST_PLANS.DELETED_AT.isNull)
            .awaitFirstOrNull()
            ?.let { mapRecordToBoostPlan(it) }
    }

    override suspend fun findAll(): List<BoostPlan> {
        return dsl.selectFrom(BOOST_PLANS)
            .where(BOOST_PLANS.DELETED_AT.isNull)
            .awaitList()
            .map { mapRecordToBoostPlan(it) }
    }

    override suspend fun save(plan: BoostPlan): BoostPlan {
        val record = dsl.insertInto(BOOST_PLANS)
            .set(BOOST_PLANS.NAME, plan.name)
            .set(BOOST_PLANS.DESCRIPTION, plan.description)
            .set(BOOST_PLANS.DURATION_DAYS, plan.durationDays)
            .set(BOOST_PLANS.PRICE_CENTS, plan.priceCents)
            .set(BOOST_PLANS.ACTIVATED_AT, plan.activatedAt)
            .returningResult()
            .awaitFirst()

        return plan.copy(id = record.get(BOOST_PLANS.ID)!!)
    }

    override suspend fun update(plan: BoostPlan): BoostPlan {
        dsl.update(BOOST_PLANS)
            .set(BOOST_PLANS.NAME, plan.name)
            .set(BOOST_PLANS.DESCRIPTION, plan.description)
            .set(BOOST_PLANS.DURATION_DAYS, plan.durationDays)
            .set(BOOST_PLANS.PRICE_CENTS, plan.priceCents)
            .set(BOOST_PLANS.ACTIVATED_AT, plan.activatedAt)
            .set(BOOST_PLANS.UPDATED_AT, LocalDateTime.now())
            .where(BOOST_PLANS.ID.eq(plan.id))
            .awaitFirst()

        return plan.copy(updatedAt = LocalDateTime.now())
    }

    override suspend fun delete(id: UUID) {
        dsl.update(BOOST_PLANS)
            .set(BOOST_PLANS.DELETED_AT, LocalDateTime.now())
            .where(BOOST_PLANS.ID.eq(id))
            .awaitFirst()
    }

    private fun mapRecordToBoostPlan(record: Record): BoostPlan {
        return BoostPlan(
            id = record.get(BOOST_PLANS.ID)!!,
            name = record.get(BOOST_PLANS.NAME)!!,
            description = record.get(BOOST_PLANS.DESCRIPTION),
            durationDays = record.get(BOOST_PLANS.DURATION_DAYS)!!,
            priceCents = record.get(BOOST_PLANS.PRICE_CENTS)!!,
            activatedAt = record.get(BOOST_PLANS.ACTIVATED_AT),
            deletedAt = record.get(BOOST_PLANS.DELETED_AT),
            createdAt = record.get(BOOST_PLANS.CREATED_AT)!!,
            updatedAt = record.get(BOOST_PLANS.UPDATED_AT)!!
        )
    }
}
