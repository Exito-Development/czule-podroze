package pl.czulapodroz.api.common.error;

import java.util.Map;
import org.springframework.http.HttpStatus;

/**
 * Wyjątek domenowy tłumaczony na odpowiedź HTTP.
 *
 * `code` to stabilny, maszynowy identyfikator błędu (np. `seats.unavailable`),
 * po którym frontend może rozpoznać sytuację bez parsowania komunikatu.
 */
public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final String code;
    private final transient Map<String, Object> details;

    protected ApiException(HttpStatus status, String code, String message) {
        this(status, code, message, Map.of());
    }

    protected ApiException(
            HttpStatus status, String code, String message, Map<String, Object> details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = Map.copyOf(details);
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public Map<String, Object> getDetails() {
        return details;
    }
}
