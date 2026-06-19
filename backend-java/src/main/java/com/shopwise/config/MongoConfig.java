package com.shopwise.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "com.shopwise.repository")
public class MongoConfig {
    // Spring Boot auto-configures the MongoDB connection via application.properties.
    // Auditing is enabled here so @CreatedDate and @LastModifiedDate are populated.
}
