package pl.czulapodroz.api.common.error;

import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Tłumaczy wyjątki na jednolity {@link ApiErrorResponse}.
 *
 * Zasada: komunikaty widoczne dla klientki są po polsku i nie zdradzają
 * szczegółów technicznych; pełny stack trace trafia wyłącznie do logów.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiErrorResponse> handleApiException(ApiException exception) {
        log.debug("Błąd domenowy {}: {}", exception.getCode(), exception.getMessage());
        return ResponseEntity.status(exception.getStatus())
                .body(
                        ApiErrorResponse.of(
                                exception.getStatus().value(),
                                exception.getCode(),
                                exception.getMessage(),
                                exception.getDetails()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception) {
        List<ApiErrorResponse.FieldError> fields =
                exception.getBindingResult().getFieldErrors().stream()
                        .map(
                                error ->
                                        new ApiErrorResponse.FieldError(
                                                error.getField(),
                                                error.getDefaultMessage() == null
                                                        ? "Wartość jest nieprawidłowa"
                                                        : error.getDefaultMessage()))
                        .toList();
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.validation("Formularz zawiera błędy", fields));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception) {
        List<ApiErrorResponse.FieldError> fields =
                exception.getConstraintViolations().stream()
                        .map(
                                violation ->
                                        new ApiErrorResponse.FieldError(
                                                violation.getPropertyPath().toString(),
                                                violation.getMessage()))
                        .toList();
        return ResponseEntity.badRequest()
                .body(ApiErrorResponse.validation("Żądanie zawiera błędy", fields));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableBody(
            HttpMessageNotReadableException exception) {
        log.debug("Nieczytelne ciało żądania", exception);
        return ResponseEntity.badRequest()
                .body(
                        ApiErrorResponse.of(
                                400, "request.unreadable", "Nie udało się odczytać żądania"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiErrorResponse.of(403, "access.denied", "Brak uprawnień"));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoResource(NoResourceFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiErrorResponse.of(404, "resource.notFound", "Nie znaleziono zasobu"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception exception) {
        log.error("Nieobsłużony błąd", exception);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        ApiErrorResponse.of(
                                500,
                                "server.error",
                                "Coś poszło nie tak. Spróbuj ponownie za chwilę."));
    }
}
