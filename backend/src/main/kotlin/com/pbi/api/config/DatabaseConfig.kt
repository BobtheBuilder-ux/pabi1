package com.pbi.api.config

import io.r2dbc.spi.ConnectionFactory
import org.jooq.DSLContext
import org.jooq.SQLDialect
import org.jooq.impl.DSL
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.r2dbc.connection.R2dbcTransactionManager
import org.springframework.transaction.ReactiveTransactionManager

@Configuration
class DatabaseConfig {


    @Bean
    fun reactiveTransactionManager(connectionFactory: ConnectionFactory): ReactiveTransactionManager {
        return R2dbcTransactionManager(connectionFactory)
    }

    @Bean
    fun dslContext(connectionFactory: ConnectionFactory): DSLContext {
//        val connection = runBlocking {  connectionFactory.create().awaitFirst() }
//        Cannot exchange messages because the connection is closed
//        LoggingConnection(connection)
        return DSL.using(connectionFactory/*LoggingConnection(connection)*/, SQLDialect.POSTGRES)
    }
} 