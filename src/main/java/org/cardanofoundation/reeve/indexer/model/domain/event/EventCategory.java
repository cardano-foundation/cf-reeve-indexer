package org.cardanofoundation.reeve.indexer.model.domain.event;

/**
 * Classifies a {@code FUNDING} bundle event as either a well-known grant-lifecycle event
 * ({@link GrantEventType}) or an organisation-defined custom event.
 */
public enum EventCategory {
    GRANT, CUSTOM
}
