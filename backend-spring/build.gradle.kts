plugins {
    java
    id("org.springframework.boot") version "4.0.6"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.diffplug.spotless") version "7.0.2"
}

group = "vn.edu.hcmus.homestay"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(25)
    }
}

repositories {
    mavenCentral()
}

dependencyManagement {
    imports {
        mavenBom("org.testcontainers:testcontainers-bom:1.21.1")
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-webmvc")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
    testImplementation("org.springframework.boot:spring-boot-starter-validation-test")
    testImplementation("org.springframework.boot:spring-boot-resttestclient")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("org.testcontainers:junit-jupiter")
    testImplementation("org.testcontainers:postgresql")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
    useJUnitPlatform()
    // Forward parity-harness vars into the forked test JVM as system properties.
    // Accepts env vars (EXPRESS_URL, TEST_EMAIL, TEST_PASSWORD)
    // or Gradle project properties (-PexpressUrl=..., -PtestEmail=..., -PtestPassword=...).
    // Forward parity-harness vars into the forked test JVM as system properties.
    // Accepts env vars (EXPRESS_URL, SPRING_URL, TEST_EMAIL, TEST_PASSWORD)
    // or Gradle project properties (-PexpressUrl=..., -PspringUrl=..., etc.).
    mapOf(
        "EXPRESS_URL"   to "expressUrl",
        "SPRING_URL"    to "springUrl",
        "TEST_EMAIL"    to "testEmail",
        "TEST_PASSWORD" to "testPassword",
    ).forEach { (envKey, propKey) ->
        val v = System.getenv(envKey) ?: (project.findProperty(propKey) as? String ?: "")
        if (v.isNotEmpty()) systemProperty(envKey, v)
    }
}

// Lint. Text-only rules for now: google-java-format does not yet parse Java 25,
// so we avoid AST-based formatting until it catches up. `gradle check` runs spotlessCheck.
spotless {
    java {
        target("src/**/*.java")
        trimTrailingWhitespace()
        endWithNewline()
    }
    kotlinGradle {
        target("*.gradle.kts")
        trimTrailingWhitespace()
        endWithNewline()
    }
}
