package com.pbi.api.config

import kotlinx.coroutines.reactive.awaitFirst
import org.jooq.Record
import org.jooq.SelectFinalStep
import reactor.core.publisher.Flux

/**
 * Extension function that converts a JOOQ SelectFinalStep to a List by wrapping it in Flux,
 * collecting to a list, and awaiting the result.
 *
 * @param T The record type, must be a subtype of Record
 * @return List of records from the query execution
 */
suspend fun <T : Record> SelectFinalStep<T>.awaitList(): List<T> {
    return Flux.from(this)
        .collectList()
        .awaitFirst()
}