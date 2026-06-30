package org.cardanofoundation.reeve.indexer.model.domain.event;

/**
 * Classifies an {@code EVENT_BUNDLE} event as either a well-known grant-lifecycle event
 * ({@link GrantEventType}) or an organisation-defined custom event.
 */
public enum EventCategory {
    GRANT, CUSTOM
}
