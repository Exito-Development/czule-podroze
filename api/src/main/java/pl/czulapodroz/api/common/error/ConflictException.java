package pl.czulapodroz.api.common.error;

import java.util.Map;
import org.springframework.http.HttpStatus;

/** Żądanie jest poprawne, ale stan zasobu na nie nie pozwala. */
public class ConflictException extends ApiException {

    public ConflictException(String code, String message) {
        super(HttpStatus.CONFLICT, code, message);
    }

    public ConflictException(String code, String message, Map<String, Object> details) {
        super(HttpStatus.CONFLICT, code, message, details);
    }
}
