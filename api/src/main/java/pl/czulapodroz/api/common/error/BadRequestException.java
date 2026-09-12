package pl.czulapodroz.api.common.error;

import org.springframework.http.HttpStatus;

/** Żądanie jest semantycznie niepoprawne. */
public class BadRequestException extends ApiException {

    public BadRequestException(String code, String message) {
        super(HttpStatus.BAD_REQUEST, code, message);
    }
}
