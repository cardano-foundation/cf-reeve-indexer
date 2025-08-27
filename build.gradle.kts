plugins {
    java
    id("org.springframework.boot") version "3.3.3"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.diffplug.spotless") version "6.19.0"
    id("java")
}

group = "org.cardanofoundation"
version = "0.0.1-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("com.bloxbean.cardano:yaci-store-spring-boot-starter:0.1.4")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")
    // Jackson annotations are useful for the generated classes
    implementation("com.fasterxml.jackson.core:jackson-annotations")
    implementation("com.bloxbean.cardano:yaci-store-metadata-spring-boot-starter:0.1.4")
    implementation("org.postgresql:postgresql")

    // implementation("org.zalando:problem-spring-web-starter:0.29.1")
    compileOnly("org.projectlombok:lombok:1.18.32")
    annotationProcessor("org.projectlombok:lombok:1.18.32")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

}

tasks.withType<Test> {
    useJUnitPlatform()
}

spotless {
        java {
            target("**/src/**/*.java")

            // Exclude target directory
            targetExclude("**/target/**/*.java")

            // Remove wildcard imports
            removeUnusedImports()

            // Define the import order
            importOrder("java", "jakarta", "javax", "lombok", "org.springframework", "", "org.junit", "org.cardanofoundation", "#")

            // Trim trailing whitespace
            trimTrailingWhitespace()

            // Set indentation: 2 spaces per tab
            indentWithSpaces(2)

            // Ensure files end with a newline
            endWithNewline()
        }
    }
