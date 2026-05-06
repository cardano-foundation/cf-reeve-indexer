package org.cardanofoundation.reeve.indexer.util;

import static org.junit.jupiter.api.Assertions.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

class ReportFieldParserTest {

    @Test
    void testExtractFieldValue_OldFormatString() {
        String value = "1234.56";
        String result = ReportFieldParser.extractFieldValue(value);
        assertEquals("1234.56", result);
    }

    @Test
    void testExtractFieldValue_NewFormatWithV() {
        Map<String, Object> fieldMap = new HashMap<>();
        fieldMap.put("v", "1234.56");
        fieldMap.put("_o", 0);

        String result = ReportFieldParser.extractFieldValue(fieldMap);
        assertEquals("1234.56", result);
    }

    @Test
    void testExtractFieldValue_Null() {
        String result = ReportFieldParser.extractFieldValue(null);
        assertNull(result);
    }

    @Test
    void testExtractFieldValue_InvalidType() {
        Integer invalidValue = 123;
        String result = ReportFieldParser.extractFieldValue(invalidValue);
        assertNull(result);
    }

    @Test
    void testIsLeafField_OldFormatString() {
        String value = "1234.56";
        assertTrue(ReportFieldParser.isLeafField(value));
    }

    @Test
    void testIsLeafField_NewFormatWithV() {
        Map<String, Object> fieldMap = new HashMap<>();
        fieldMap.put("v", "1234.56");
        fieldMap.put("_o", 0);

        assertTrue(ReportFieldParser.isLeafField(fieldMap));
    }

    @Test
    void testIsLeafField_SectionWithoutV() {
        Map<String, Object> sectionMap = new HashMap<>();
        sectionMap.put("_o", 0);
        sectionMap.put("child_field", "value");

        assertFalse(ReportFieldParser.isLeafField(sectionMap));
    }

    @Test
    void testIsLeafField_InvalidType() {
        Integer invalidValue = 123;
        assertFalse(ReportFieldParser.isLeafField(invalidValue));
    }

    @Test
    void testGetFieldOrder_NewFormat() {
        Map<String, Object> fieldMap = new HashMap<>();
        fieldMap.put("v", "1234.56");
        fieldMap.put("_o", 5);

        Integer order = ReportFieldParser.getFieldOrder(fieldMap);
        assertEquals(5, order);
    }

    @Test
    void testGetFieldOrder_OldFormatNoOrder() {
        String value = "1234.56";
        Integer order = ReportFieldParser.getFieldOrder(value);
        assertNull(order);
    }

    @Test
    void testGetFieldOrder_SectionOldFormat() {
        Map<String, Object> sectionMap = new HashMap<>();
        sectionMap.put("child_field", "value");

        Integer order = ReportFieldParser.getFieldOrder(sectionMap);
        assertNull(order);
    }

    @Test
    void testGetNestedFieldValue_OldFormat() {
        Map<String, Object> parentMap = new HashMap<>();
        parentMap.put("assets", "5000");

        String value = ReportFieldParser.getNestedFieldValue(parentMap, "assets");
        assertEquals("5000", value);
    }

    @Test
    void testGetNestedFieldValue_NewFormat() {
        Map<String, Object> fieldMap = new HashMap<>();
        fieldMap.put("v", "5000");
        fieldMap.put("_o", 0);

        Map<String, Object> parentMap = new HashMap<>();
        parentMap.put("assets", fieldMap);

        String value = ReportFieldParser.getNestedFieldValue(parentMap, "assets");
        assertEquals("5000", value);
    }

    @Test
    void testGetNestedFieldValue_NotFound() {
        Map<String, Object> parentMap = new HashMap<>();
        parentMap.put("other_field", "value");

        String value = ReportFieldParser.getNestedFieldValue(parentMap, "assets");
        assertNull(value);
    }

    @Test
    void testGetNestedFieldValue_NullParent() {
        String value = ReportFieldParser.getNestedFieldValue(null, "assets");
        assertNull(value);
    }

    @Test
    void testGetNestedSection_OldFormat() {
        Map<String, Object> nestedMap = new HashMap<>();
        nestedMap.put("field1", "value1");

        Map<String, Object> parentMap = new HashMap<>();
        parentMap.put("section", nestedMap);

        Map<String, Object> result = ReportFieldParser.getNestedSection(parentMap, "section");
        assertNotNull(result);
        assertEquals("value1", result.get("field1"));
    }

    @Test
    void testGetNestedSection_NewFormat() {
        Map<String, Object> nestedMap = new HashMap<>();
        nestedMap.put("_o", 0);
        nestedMap.put("field1", "value1");

        Map<String, Object> parentMap = new HashMap<>();
        parentMap.put("section", nestedMap);

        Map<String, Object> result = ReportFieldParser.getNestedSection(parentMap, "section");
        assertNotNull(result);
        assertEquals("value1", result.get("field1"));
        assertEquals(0, result.get("_o"));
    }

    @Test
    void testGetNestedSection_NotFound() {
        Map<String, Object> parentMap = new HashMap<>();
        parentMap.put("other_section", new HashMap<>());

        Map<String, Object> result = ReportFieldParser.getNestedSection(parentMap, "section");
        assertNull(result);
    }

    @Test
    void testGetNestedSection_NullParent() {
        Map<String, Object> result = ReportFieldParser.getNestedSection(null, "section");
        assertNull(result);
    }

    @Test
    void testExtractFieldValueOrDefault_WithValue() {
        Map<String, Object> fieldMap = new HashMap<>();
        fieldMap.put("v", "1234.56");

        String result = ReportFieldParser.extractFieldValueOrDefault(fieldMap, "0");
        assertEquals("1234.56", result);
    }

    @Test
    void testExtractFieldValueOrDefault_NoValue() {
        Map<String, Object> fieldMap = new HashMap<>();
        fieldMap.put("_o", 0);

        String result = ReportFieldParser.extractFieldValueOrDefault(fieldMap, "0");
        assertEquals("0", result);
    }

    @Test
    void testComplexNestedStructure() {
        // Old format structure
        Map<String, Object> oldFormatAssets = new HashMap<>();
        oldFormatAssets.put("crypto_assets", "5000");
        oldFormatAssets.put("cash_and_cash_equivalents", "2000");

        Map<String, Object> oldFormatCurrentAssets = new HashMap<>();
        oldFormatCurrentAssets.put("current_assets", oldFormatAssets);

        // New format structure
        Map<String, Object> newFormatCryptoAssets = new HashMap<>();
        newFormatCryptoAssets.put("v", "5000");
        newFormatCryptoAssets.put("_o", 0);

        Map<String, Object> newFormatCash = new HashMap<>();
        newFormatCash.put("v", "2000");
        newFormatCash.put("_o", 1);

        Map<String, Object> newFormatAssets = new HashMap<>();
        newFormatAssets.put("_o", 0);
        newFormatAssets.put("crypto_assets", newFormatCryptoAssets);
        newFormatAssets.put("cash_and_cash_equivalents", newFormatCash);

        Map<String, Object> newFormatCurrentAssets = new HashMap<>();
        newFormatCurrentAssets.put("current_assets", newFormatAssets);

        // Test old format
        Map<String, Object> oldCurrentAssets = ReportFieldParser.getNestedSection(oldFormatCurrentAssets,
                "current_assets");
        assertNotNull(oldCurrentAssets);
        String oldCryptoValue = ReportFieldParser.getNestedFieldValue(oldCurrentAssets, "crypto_assets");
        assertEquals("5000", oldCryptoValue);

        // Test new format
        Map<String, Object> newCurrentAssets = ReportFieldParser.getNestedSection(newFormatCurrentAssets,
                "current_assets");
        assertNotNull(newCurrentAssets);
        String newCryptoValue = ReportFieldParser.getNestedFieldValue(newCurrentAssets, "crypto_assets");
        assertEquals("5000", newCryptoValue);
    }

    @Test
    void testTransformFieldForDisplay_OldFormat() {
        String oldValue = "1234.56";
        Object result = ReportFieldParser.transformFieldForDisplay(oldValue);
        assertEquals("1234.56", result);
    }

    @Test
    void testTransformFieldForDisplay_LeafFieldNewFormat() {
        Map<String, Object> leafField = new HashMap<>();
        leafField.put("v", "1234.56");
        leafField.put("_o", 0);

        Object result = ReportFieldParser.transformFieldForDisplay(leafField);
        assertEquals("1234.56", result);
    }

    @Test
    void testTransformFieldForDisplay_SectionWithOrdering() {
        Map<String, Object> field3 = new HashMap<>();
        field3.put("v", "300");
        field3.put("_o", 2);

        Map<String, Object> field1 = new HashMap<>();
        field1.put("v", "100");
        field1.put("_o", 0);

        Map<String, Object> field2 = new HashMap<>();
        field2.put("v", "200");
        field2.put("_o", 1);

        Map<String, Object> section = new HashMap<>();
        section.put("_o", 0);
        section.put("field3", field3);
        section.put("field1", field1);
        section.put("field2", field2);

        Object result = ReportFieldParser.transformFieldForDisplay(section);
        assertTrue(result instanceof Map);

        @SuppressWarnings("unchecked")
        Map<String, Object> resultMap = (Map<String, Object>) result;

        // Verify ordering - fields should be in ascending order by _o
        var keys = resultMap.keySet().stream().toList();
        assertEquals("field1", keys.get(0));
        assertEquals("field2", keys.get(1));
        assertEquals("field3", keys.get(2));

        // Verify values are unwrapped
        assertEquals("100", resultMap.get("field1"));
        assertEquals("200", resultMap.get("field2"));
        assertEquals("300", resultMap.get("field3"));

        // Verify _o is not in the result
        assertFalse(resultMap.containsKey("_o"));
    }

    @Test
    void testTransformReportForDisplay_CompleteReport() {
        Map<String, Object> revenue1 = new HashMap<>();
        revenue1.put("v", "1000");
        revenue1.put("_o", 1);

        Map<String, Object> revenue0 = new HashMap<>();
        revenue0.put("v", "500");
        revenue0.put("_o", 0);

        Map<String, Object> revenues = new HashMap<>();
        revenues.put("_o", 0);
        revenues.put("staking_rewards", revenue1);
        revenues.put("bank_interest", revenue0);

        Map<String, Object> expense1 = new HashMap<>();
        expense1.put("v", "200");
        expense1.put("_o", 1);

        Map<String, Object> expense0 = new HashMap<>();
        expense0.put("v", "100");
        expense0.put("_o", 0);

        Map<String, Object> expenses = new HashMap<>();
        expenses.put("_o", 1);
        expenses.put("personnel", expense1);
        expenses.put("rent", expense0);

        Map<String, Object> report = new HashMap<>();
        report.put("revenues", revenues);
        report.put("expenses", expenses);

        Map<String, Object> transformed = ReportFieldParser.transformReportForDisplay(report);
        assertNotNull(transformed);

        var topLevelKeys = transformed.keySet().stream().toList();
        assertEquals("revenues", topLevelKeys.get(0)); // _o=0
        assertEquals("expenses", topLevelKeys.get(1)); // _o=1

        @SuppressWarnings("unchecked")
        Map<String, Object> transformedRevenues = (Map<String, Object>) transformed.get("revenues");
        assertNotNull(transformedRevenues);
        var revenueKeys = transformedRevenues.keySet().stream().toList();
        assertEquals("bank_interest", revenueKeys.get(0)); // _o=0
        assertEquals("staking_rewards", revenueKeys.get(1)); // _o=1
        assertEquals("500", transformedRevenues.get("bank_interest"));
        assertEquals("1000", transformedRevenues.get("staking_rewards"));
    }

    @Test
    void testTransformReportForDisplay_Null() {
        Map<String, Object> result = ReportFieldParser.transformReportForDisplay(null);
        assertNull(result);
    }
}
