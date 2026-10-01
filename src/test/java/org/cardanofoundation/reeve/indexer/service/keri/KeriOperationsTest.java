package org.cardanofoundation.reeve.indexer.service.keri;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import id.veridian.signify.generated.keria.model.CompletedOOBIOperation;
import id.veridian.signify.generated.keria.model.FailedOOBIOperation;
import id.veridian.signify.generated.keria.model.OperationStatus;

import org.junit.jupiter.api.Test;

/**
 * {@code operations().wait} RETURNS a done {@code FailedOperation} rather than throwing (it throws
 * only for a failed dependency operation), so every wait result has to be checked or a failed KERIA
 * operation is silently treated as a success.
 */
class KeriOperationsTest {

    @Test
    void failedOperationThrowsWithCodeAndStage() {
        FailedOOBIOperation failed = new FailedOOBIOperation()
                .name("oobi.ABC")
                .error(new OperationStatus().code(404).message("oobi not found"));

        RuntimeException e = assertThrows(RuntimeException.class,
                () -> KeriOperations.requireNotFailed(failed, "schema OOBI resolve"));

        assertTrue(e.getMessage().contains("schema OOBI resolve"), e.getMessage());
        assertTrue(e.getMessage().contains("404"), e.getMessage());
        assertTrue(e.getMessage().contains("oobi not found"), e.getMessage());
        assertTrue(e.getMessage().contains("oobi.ABC"), e.getMessage());
    }

    @Test
    void failedOperationWithoutErrorDetailsStillThrows() {
        FailedOOBIOperation failed = new FailedOOBIOperation().name("oobi.XYZ");

        assertThrows(RuntimeException.class, () -> KeriOperations.requireNotFailed(failed, "resolve"));
    }

    @Test
    void doneNonFailedOperationPasses() {
        CompletedOOBIOperation completed = new CompletedOOBIOperation().name("oobi.ABC");

        assertSame(completed, KeriOperations.requireNotFailed(completed, "resolve"));
    }

    @Test
    void nullThrows() {
        RuntimeException e = assertThrows(RuntimeException.class,
                () -> KeriOperations.requireNotFailed(null, "admit"));

        assertTrue(e.getMessage().contains("admit"), e.getMessage());
    }
}
