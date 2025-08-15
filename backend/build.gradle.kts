import org.jooq.meta.kotlin.database
import org.jooq.meta.kotlin.generator
import org.jooq.meta.kotlin.jdbc
import org.jooq.meta.kotlin.target
import org.testcontainers.containers.PostgreSQLContainer
import org.testcontainers.containers.wait.strategy.Wait
import org.testcontainers.utility.DockerImageName

plugins {
    kotlin("jvm") version "2.2.0"
    kotlin("plugin.spring") version "2.2.0"
    id("org.springframework.boot") version "3.5.3"
    id("io.spring.dependency-management") version "1.1.7"
    id("org.flywaydb.flyway") version "11.8.2"
    id("nu.studer.jooq") version "10.1"
}
group = "com.pbi"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(24)
    }
}

repositories {
    mavenCentral()
}

val jooqVersion = "3.20.5"
val flywayVersion = "11.8.2"

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-r2dbc")
    implementation("org.springframework.boot:spring-boot-starter-jooq")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-webflux")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("io.projectreactor.kotlin:reactor-kotlin-extensions")
    implementation("org.flywaydb:flyway-core:$flywayVersion")
    implementation("org.flywaydb:flyway-database-postgresql:$flywayVersion")
    implementation("org.jetbrains.kotlin:kotlin-reflect:2.2.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor:1.10.2")
//    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactive:1.10.2")
    implementation("org.springframework:spring-jdbc")
    implementation("org.jooq:jooq-kotlin:$jooqVersion")
    implementation("org.jooq:jooq-kotlin-coroutines:$jooqVersion")

    // Swagger/OpenAPI Documentation
    implementation("org.springdoc:springdoc-openapi-starter-webflux-ui:2.8.9")

    // https://mvnrepository.com/artifact/io.github.oshai/kotlin-logging-jvm
    implementation("io.github.oshai:kotlin-logging-jvm:7.0.7")

    // JWT dependencies
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    implementation("io.jsonwebtoken:jjwt-impl:0.12.6")
    implementation("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // Cloudinary for image uploads
    implementation("com.cloudinary:cloudinary-http5:2.3.0")

    // Email service - Resend
    implementation("com.resend:resend-java:3.1.0")

    // Thymeleaf for email templates
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")

    developmentOnly("org.springframework.boot:spring-boot-devtools")

    // Test dependencies
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.projectreactor:reactor-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")
    testImplementation("org.testcontainers:r2dbc")

    jooqGenerator("org.postgresql:postgresql:42.7.7")
    jooqGenerator("org.jooq:jooq-meta:$jooqVersion")
    jooqGenerator("org.jooq:jooq:$jooqVersion")

    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("org.postgresql:r2dbc-postgresql")
}

kotlin {
    compilerOptions {
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}

tasks.getByName<org.springframework.boot.gradle.tasks.bundling.BootBuildImage>("bootBuildImage") {
    docker {
        publishRegistry {
            username = System.getenv("DOCKER_USERNAME")
            password = System.getenv("DOCKER_PASSWORD")
        }
    }
}

buildscript {
    dependencies {
        classpath("org.testcontainers:postgresql:1.21.2")
        classpath("org.postgresql:postgresql:42.7.7")
        classpath("org.flywaydb:flyway-database-postgresql:11.8.2")
    }
}

jooq {
    version.set("3.20.5")  // default (can be omitted)
    edition.set(nu.studer.gradle.jooq.JooqEdition.OSS)  // default (can be omitted)

    configurations {
        create("main") {  // name of the jOOQ configuration
            generateSchemaSourceOnCompilation.set(true)  // default (can be omitted)

            jooqConfiguration {
                logging = org.jooq.meta.jaxb.Logging.WARN
                jdbc {
                    driver = "org.postgresql.Driver"
                }
                generator {
                    name = "org.jooq.codegen.KotlinGenerator"
                    database {
                        name = "org.jooq.meta.postgres.PostgresDatabase"
                        inputSchema = "public"
                        isIncludeIndexes = false
                        excludes = "flyway.*"
                    }
                    generate.apply {
                        isDeprecated = false
                        isRecords = true
                        isImmutablePojos = true
                        isFluentSetters = true
                        withKotlinSetterJvmNameAnnotationsOnIsPrefix(false)
                    }
                    target {
                        packageName = "com.pbi.generated"
                        directory = "build/generated-src/jooq/main"
                    }
                    strategy.name = "org.jooq.codegen.DefaultGeneratorStrategy"
                }
            }
        }
    }
}
var containerInstance: PostgreSQLContainer<Nothing>? = null

var runJooq = project.findProperty("runJooqTask") == project.name

tasks.named("flywayMigrate").configure {
    enabled = runJooq
}

tasks.named<nu.studer.gradle.jooq.JooqGenerate>("generateJooq").configure {
    allInputsDeclared.set(true)
    enabled = runJooq
    dependsOn("flywayMigrate")
}

tasks.named("build") {
    dependsOn("generateJooq")
}

tasks.register("GenerateJooqClasses") {
    group = "jooq"
    description = "This tasks is meant run in local development to generate jooq classes."
    dependsOn("flywayMigrate")
    dependsOn("generateJooq")
    doLast {
        println("Stopping PostgreSQL container")
        containerInstance?.stop()
    }
}

project.gradle.taskGraph.addTaskExecutionGraphListener { graph ->
    val allTasks = graph.allTasks.map { it.name }
    if (allTasks.contains("GenerateJooqClasses")) {
        tasks.getByName("flywayMigrate").enabled = true
        tasks.getByName("generateJooq").enabled = true
    }

    if (tasks.getByName("generateJooq").enabled) {

        println("Starting PostgreSQL container")
        containerInstance =
            containerInstance
                ?: PostgreSQLContainer<Nothing>(DockerImageName.parse("postgres:18beta1-alpine3.22")).apply {
                    withDatabaseName("pbi")
                    start()
                }
        containerInstance!!.waitingFor(Wait.forListeningPort())
        println("PostgreSQL container started successfully with jdbcUrl: ${containerInstance!!.jdbcUrl}")

        flyway {
            url = containerInstance!!.jdbcUrl
            user = containerInstance!!.username
            password = containerInstance!!.password
            locations = arrayOf("filesystem:src/main/resources/db/migration")
        }

        jooq.configurations.getByName("main").jooqConfiguration.jdbc.apply {
            url = containerInstance!!.jdbcUrl
            user = containerInstance!!.username
            password = containerInstance?.password
        }
    }
}