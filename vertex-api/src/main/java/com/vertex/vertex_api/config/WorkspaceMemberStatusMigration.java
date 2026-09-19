package com.vertex.vertex_api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Locale;

@Component
@Profile("local")
public class WorkspaceMemberStatusMigration {

    private static final Logger log = LoggerFactory.getLogger(WorkspaceMemberStatusMigration.class);

    private final JdbcTemplate jdbcTemplate;

    public WorkspaceMemberStatusMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void addMissingStatusColumn() {
        if (!tableExists("workspace_members")) {
            return;
        }

        if (columnExists("workspace_members", "status")) {
            return;
        }

        jdbcTemplate.execute("ALTER TABLE workspace_members ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACCEPTED'");
        log.info("Added missing workspace_members.status column");
    }

    private boolean tableExists(String tableName) {
        return Boolean.TRUE.equals(jdbcTemplate.execute((ConnectionCallback<Boolean>) connection -> {
            DatabaseMetaData metaData = connection.getMetaData();
            return hasTable(metaData, tableName);
        }));
    }

    private boolean columnExists(String tableName, String columnName) {
        return Boolean.TRUE.equals(jdbcTemplate.execute((ConnectionCallback<Boolean>) connection -> {
            DatabaseMetaData metaData = connection.getMetaData();
            return hasColumn(metaData, tableName, columnName);
        }));
    }

    private boolean hasTable(DatabaseMetaData metaData, String tableName) throws SQLException {
        return hasMatchingRow(metaData.getTables(null, null, tableName, new String[]{"TABLE"}))
                || hasMatchingRow(metaData.getTables(null, null, tableName.toUpperCase(Locale.ROOT), new String[]{"TABLE"}))
                || hasMatchingRow(metaData.getTables(null, null, tableName.toLowerCase(Locale.ROOT), new String[]{"TABLE"}));
    }

    private boolean hasColumn(DatabaseMetaData metaData, String tableName, String columnName) throws SQLException {
        return hasMatchingRow(metaData.getColumns(null, null, tableName, columnName))
                || hasMatchingRow(metaData.getColumns(null, null, tableName.toUpperCase(Locale.ROOT), columnName.toUpperCase(Locale.ROOT)))
                || hasMatchingRow(metaData.getColumns(null, null, tableName.toLowerCase(Locale.ROOT), columnName.toLowerCase(Locale.ROOT)));
    }

    private boolean hasMatchingRow(ResultSet resultSet) throws SQLException {
        try (ResultSet rs = resultSet) {
            return rs.next();
        }
    }
}

