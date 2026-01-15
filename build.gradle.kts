plugins {
    java
    id("org.springframework.boot") version "3.3.3"
    id("io.spring.dependency-management") version "1.1.7"
    id("com.diffplug.spotless") version "6.19.0"
    id("java")
}

group = "org.cardanofoundation"
version = "1.0.0-SNAPSHOT"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenLocal()
    mavenCentral()
    maven {
        name = "Central Portal Snapshots"
        url = uri("https://central.sonatype.com/repository/maven-snapshots/")

        // Only search this repository for the specific dependency
        content {
            includeModule("org.cardanofoundation", "signify")
        }
    }
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("com.bloxbean.cardano:yaci-store-spring-boot-starter:0.1.4")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.5.0")
    // Jackson annotations are useful for the generated classes
    implementation("com.fasterxml.jackson.core:jackson-annotations")
    implementation("org.postgresql:postgresql")
    implementation("io.hypersistence:hypersistence-utils-hibernate-63:3.7.3")

    // Keri
    implementation("org.cardanofoundation:signify:0.1.2-ebfb904-SNAPSHOT")

    // Yaci store
    implementation("com.bloxbean.cardano:cardano-client-crypto:0.6.0")
    implementation("com.bloxbean.cardano:yaci-store-metadata-spring-boot-starter:0.1.6")
    implementation("com.bloxbean.cardano:yaci-store-utxo-spring-boot-starter:0.1.6")
    implementation("com.bloxbean.cardano:yaci-store-script-spring-boot-starter:0.1.6")
    implementation("com.bloxbean.cardano:yaci-store-assets-spring-boot-starter:0.1.6")
    implementation("com.bloxbean.cardano:aiken-java-binding:0.1.0")

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

tasks.bootJar {
    archiveClassifier = "all"
}
