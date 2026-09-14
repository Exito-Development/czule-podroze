package pl.czulapodroz.api.common.error;

import org.springframework.http.HttpStatus;

/** Brak lub nieważne poświadczenia. */
public class UnauthorizedException extends ApiException {

    public UnauthorizedException(String code, String message) {
        super(HttpStatus.UNAUTHORIZED, code, message);
    }
}
