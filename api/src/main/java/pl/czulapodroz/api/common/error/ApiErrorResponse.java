package pl.czulapodroz.api.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Jednolity kształt błędu zwracanego przez API.
 *
 * @param timestamp    moment wystąpienia błędu
 * @param status       kod HTTP
 * @param code         stabilny identyfikator błędu (np. `seats.unavailable`)
 * @param message      komunikat dla człowieka (po polsku — trafia do UI)
 * @param details      dodatkowy kontekst, np. liczba wolnych miejsc
 * @param fieldErrors  błędy walidacji pól formularza
 */
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public record ApiErrorResponse(
        Instant timestamp,
        int status,
        String code,
        String message,
        Map<String, Object> details,
        List<FieldError> fieldErrors) {

    public record FieldError(String field, String message) {}

    public static ApiErrorResponse of(int status, String code, String message) {
        return new ApiErrorResponse(Instant.now(), status, code, message, Map.of(), List.of());
    }

    public static ApiErrorResponse of(
            int status, String code, String message, Map<String, Object> details) {
        return new ApiErrorResponse(Instant.now(), status, code, message, details, List.of());
    }

    public static ApiErrorResponse validation(String message, List<FieldError> fieldErrors) {
        return new ApiErrorResponse(
                Instant.now(), 400, "validation.failed", message, Map.of(), fieldErrors);
    }
}
