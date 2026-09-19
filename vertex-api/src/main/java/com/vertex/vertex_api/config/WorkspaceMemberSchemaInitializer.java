package com.vertex.vertex_api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.Arrays;
import java.util.Objects;

public class WorkspaceMemberSchemaInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    private static final Logger log = LoggerFactory.getLogger(WorkspaceMemberSchemaInitializer.class);

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Environment environment = applicationContext.getEnvironment();
        if (!Arrays.asList(environment.getActiveProfiles()).contains("prod")) {
            return;
        }

        String url = environment.getProperty("spring.datasource.url");
        String username = environment.getProperty("spring.datasource.username");
        String password = environment.getProperty("spring.datasource.password");
        String driverClassName = environment.getProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");

        if (url == null || url.isBlank() || username == null || username.isBlank()) {
            throw new IllegalStateException("Production datasource properties are not configured");
        }

        try {
            Class.forName(driverClassName);
        } catch (ClassNotFoundException ex) {
            throw new IllegalStateException("Could not load JDBC driver: " + driverClassName, ex);
        }

        try (Connection connection = DriverManager.getConnection(url, username, Objects.toString(password, ""))) {
            DatabaseMetaData metaData = connection.getMetaData();
            if (columnExists(metaData, "workspace_members", "status")) {
                return;
            }

            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate("ALTER TABLE workspace_members ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED'");
            }

            log.info("Ensured workspace_members.status column exists before JPA startup");
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to ensure workspace_members.status exists", ex);
        }
    }

    private boolean columnExists(DatabaseMetaData metaData, String tableName, String columnName) throws SQLException {
        return hasRow(metaData.getColumns(null, null, tableName, columnName))
                || hasRow(metaData.getColumns(null, null, tableName.toUpperCase(), columnName.toUpperCase()))
                || hasRow(metaData.getColumns(null, null, tableName.toLowerCase(), columnName.toLowerCase()));
    }

    private boolean hasRow(java.sql.ResultSet resultSet) throws SQLException {
        try (resultSet) {
            return resultSet.next();
        }
    }
}

