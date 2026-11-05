package org.cardanofoundation.reeve.indexer.service.keri;

import id.veridian.signify.generated.keria.model.FailedOperation;
import id.veridian.signify.generated.keria.model.Operation;
import id.veridian.signify.generated.keria.model.OperationStatus;

/**
 * Checks the result of {@code client.operations().wait(...)}.
 *
 * <p>{@code wait} RETURNS the done operation, including a {@link FailedOperation}; it throws
 * {@code OperationFailedException} only when a DEPENDENCY operation failed. Without this check a
 * failed KERIA operation is silently treated as a success. Callers keep their existing
 * {@code OperationFailedException} catches for the dependency case.
 *
 * <p>Deliberately no assertion on the Completed-subtype: a wrong expected subtype would break a
 * working path at runtime while mocked tests stay green. Only failure is rejected.
 */
public final class KeriOperations {

    private KeriOperations() {
    }

    /**
     * @param result the value returned by {@code operations().wait(...)}
     * @param stage  a short description of the step, carried in the error message
     * @return {@code result}, when it is neither {@code null} nor a {@link FailedOperation}
     * @throws RuntimeException when {@code result} is {@code null} or a {@link FailedOperation}; the
     *                          message carries the stage, the operation name and the error code/message
     */
    public static <T extends Operation> T requireNotFailed(T result, String stage) {
        if (result == null) {
            throw new RuntimeException("KERIA " + stage + " operation returned no result");
        }
        if (result instanceof FailedOperation failed) {
            OperationStatus error = failed.getError();
            String detail = error == null ? "no error details"
                    : "code " + error.getCode() + ": " + error.getMessage();
            throw new RuntimeException("KERIA " + stage + " operation " + result.getName()
                    + " failed (" + detail + ")");
        }
        return result;
    }
}
