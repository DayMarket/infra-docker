pluginManagement {
    repositories {
        fun getProperty(property: String, env: String) =
            requireNotNull(extra.properties[property]?.toString() ?: System.getenv(env)) {
                "Please setup gradle property '$property' or env '$env'"
            }

        fun uzumRepository(repoName: String) = maven {
            name = repoName
            val host = getProperty("uzum.nexus.host", "NEXUS_HOST")
            url = uri("https://$host/repository/$repoName")
            credentials {
                username = getProperty("uzum.nexus.user", "NEXUS_USER")
                password = getProperty("uzum.nexus.password", "NEXUS_PASSWORD")
            }
        }

        uzumRepository("maven-releases")
        uzumRepository("maven-public")
        uzumRepository("maven-snapshots")
        mavenLocal()
    }
}