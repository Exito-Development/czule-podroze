package pl.czulapodroz.api.common.error;

import org.springframework.http.HttpStatus;

/** Zasób nie istnieje (albo nie jest widoczny dla tego, kto pyta). */
public class NotFoundException extends ApiException {

    public NotFoundException(String code, String message) {
        super(HttpStatus.NOT_FOUND, code, message);
    }

    public static NotFoundException trip(String slug) {
        return new NotFoundException("trip.notFound", "Nie znaleziono wyjazdu: " + slug);
    }
}
