package org.cardanofoundation.reeve.indexer.util;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class CsvSanitizerTest {

    @Test
    void nullBecomesEmpty() {
        assertEquals("", CsvSanitizer.sanitize(null));
    }

    @Test
    void valuesStartingWithAFormulaCharacterAreEscaped() {
        assertEquals("'=SUM(A1)", CsvSanitizer.sanitize("=SUM(A1)"));
        assertEquals("'+1", CsvSanitizer.sanitize("+1"));
        assertEquals("'-1", CsvSanitizer.sanitize("-1"));
        assertEquals("'@cmd", CsvSanitizer.sanitize("@cmd"));
        assertEquals("'\tcmd", CsvSanitizer.sanitize("\tcmd"));
        assertEquals("'\rcmd", CsvSanitizer.sanitize("\rcmd"));
    }

    @Test
    void plainAndEmptyValuesStayUnchanged() {
        assertEquals("Office", CsvSanitizer.sanitize("Office"));
        assertEquals("a=b", CsvSanitizer.sanitize("a=b"));
        assertEquals("", CsvSanitizer.sanitize(""));
    }
}
