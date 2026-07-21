package org.cardanofoundation.reeve.indexer.model.domain.event;

import java.util.Arrays;

/**
 * The well-known grant-lifecycle event types of a {@code FUNDING} bundle. Any {@code type} value
 * that is not one of these is treated as an organisation-defined custom event.
 */
public enum GrantEventType {
    FUNDING, SPENDING, REFUND;

    public static boolean isGrantType(String type) {
        if (type == null) {
            return false;
        }
        return Arrays.stream(values()).anyMatch(t -> t.name().equals(type));
    }
}
