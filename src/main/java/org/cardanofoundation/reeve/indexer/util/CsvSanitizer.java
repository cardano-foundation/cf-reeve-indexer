package org.cardanofoundation.reeve.indexer.util;

public class CsvSanitizer {

    private CsvSanitizer() {
        throw new IllegalStateException("Utility class");
    }

    public static String sanitize(String value) {
        if (value == null) {
            return "";
        }
        return !value.isEmpty() && "=+-@\t\r".indexOf(value.charAt(0)) >= 0 ? "'" + value : value;
    }
}
