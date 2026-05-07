package org.cardanofoundation.reeve.indexer.util;

import java.util.Map;
import java.util.Objects;

public class ReportFieldParser {

    private ReportFieldParser() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Extracts the numeric value from a report field, handling both old and new formats.
     *
     * Old format: plain string value
     *   "field_name": "1234"
     *
     * New format: object with "v" and "_o" keys
     *   "field_name": {"v": "1234", "_o": 0}
     *
     * @param fieldValue the field value from the report (String or Map)
     * @return the numeric value as a String, or null if not found
     */
    public static String extractFieldValue(Object fieldValue) {
        if (fieldValue == null) {
            return null;
        }

        if (fieldValue instanceof String) {
            return (String) fieldValue;
        }

        if (fieldValue instanceof Map) {
            Map<String, Object> fieldMap = (Map<String, Object>) fieldValue;
            Object vKey = fieldMap.get("v");
            if (vKey != null) {
                return vKey.toString();
            }
        }

        return null;
    }

    /**
     * Checks if a field is a leaf field (contains a numeric value).
     * Distinguishes between leaf fields and section fields.
     *
     * @param fieldValue the field value to check
     * @return true if this is a leaf field with a numeric value
     */
    public static boolean isLeafField(Object fieldValue) {
        if (fieldValue instanceof String) {
            return true;
        }

        if (fieldValue instanceof Map) {
            Map<String, Object> fieldMap = (Map<String, Object>) fieldValue;
            return fieldMap.containsKey("v");
        }

        return false;
    }

    /**
     * Gets the display order (_o) of a field.
     * Returns null if no order is specified (old format).
     *
     * @param fieldValue the field value
     * @return the order (Integer) or null if not present
     */
    public static Integer getFieldOrder(Object fieldValue) {
        if (!(fieldValue instanceof Map)) {
            return null;
        }

        Map<String, Object> fieldMap = (Map<String, Object>) fieldValue;
        Object oKey = fieldMap.get("_o");
        if (oKey instanceof Integer) {
            return (Integer) oKey;
        }
        if (oKey instanceof Number) {
            return ((Number) oKey).intValue();
        }

        return null;
    }

    /**
     * Safely extracts a field value, handling type conversions and null cases.
     *
     * @param fieldValue the field value (String or Map)
     * @param defaultValue the default value if extraction fails
     * @return the extracted value or the default
     */
    public static String extractFieldValueOrDefault(Object fieldValue, String defaultValue) {
        String value = extractFieldValue(fieldValue);
        return value != null ? value : defaultValue;
    }

    /**
     * Safely gets a nested field from a map, handling both old and new formats.
     * Returns the unwrapped field value (without the "v" wrapper if present).
     *
     * @param parent the parent map
     * @param fieldName the field name to look up
     * @return the field value as a String, or null if not found
     */
    public static String getNestedFieldValue(Map<String, Object> parent, String fieldName) {
        if (parent == null) {
            return null;
        }

        Object fieldValue = parent.get(fieldName);
        return extractFieldValue(fieldValue);
    }

    /**
     * Safely gets a nested section from a map.
     * Works with both old and new formats (ignores _o key in new format).
     *
     * @param parent the parent map
     * @param sectionName the section name to look up
     * @return the section map, or null if not found
     */
    public static Map<String, Object> getNestedSection(Map<String, Object> parent, String sectionName) {
        if (parent == null) {
            return null;
        }

        Object section = parent.get(sectionName);
        if (section instanceof Map) {
            return (Map<String, Object>) section;
        }

        return null;
    }

    /**
     * Transforms report data by removing "v" wrappers and sorting by "_o" order.
     * Converts the internal format (with "v" and "_o" keys) to a clean API format.
     *
     * For leaf fields: {"v": "1000", "_o": 0} becomes "1000"
     * For sections: sorts children by "_o" and recursively transforms them
     *
     * @param fieldValue the field value to transform
     * @return the transformed value with "v" wrappers removed and proper ordering
     */
    public static Object transformFieldForDisplay(Object fieldValue) {
        if (fieldValue == null) {
            return null;
        }

        if (fieldValue instanceof String) {
            return fieldValue;
        }

        if (!(fieldValue instanceof Map)) {
            return fieldValue;
        }

        Map<String, Object> fieldMap = (Map<String, Object>) fieldValue;

        if (fieldMap.containsKey("v")) {
            return fieldMap.get("v");
        }

        Map<String, Object> transformedSection = new java.util.LinkedHashMap<>();
        java.util.List<Map.Entry<String, Object>> sortedEntries = fieldMap.entrySet().stream()
                .filter(e -> !Objects.equals(e.getKey(), "_o"))
                .sorted((a, b) -> {
                    Integer orderA = getFieldOrder(a.getValue());
                    Integer orderB = getFieldOrder(b.getValue());
                    int orderAVal = orderA != null ? orderA : Integer.MAX_VALUE;
                    int orderBVal = orderB != null ? orderB : Integer.MAX_VALUE;
                    return Integer.compare(orderAVal, orderBVal);
                })
                .toList();

        for (Map.Entry<String, Object> entry : sortedEntries) {
            transformedSection.put(entry.getKey(), transformFieldForDisplay(entry.getValue()));
        }

        return transformedSection;
    }

    /**
     * Transforms the entire report data structure for API response.
     * Removes all "v" and "_o" keys, keeping only the clean values in proper order.
     *
     * @param reportData the raw report data map
     * @return the transformed report data suitable for API response
     */
    public static Map<String, Object> transformReportForDisplay(Map<String, Object> reportData) {
        if (reportData == null) {
            return null;
        }

        Map<String, Object> transformed = new java.util.LinkedHashMap<>();
        java.util.List<Map.Entry<String, Object>> sortedEntries = reportData.entrySet().stream()
                .sorted((a, b) -> {
                    Integer orderA = getFieldOrder(a.getValue());
                    Integer orderB = getFieldOrder(b.getValue());
                    int orderAVal = orderA != null ? orderA : Integer.MAX_VALUE;
                    int orderBVal = orderB != null ? orderB : Integer.MAX_VALUE;
                    return Integer.compare(orderAVal, orderBVal);
                })
                .toList();

        for (Map.Entry<String, Object> entry : sortedEntries) {
            transformed.put(entry.getKey(), transformFieldForDisplay(entry.getValue()));
        }

        return transformed;
    }
}
