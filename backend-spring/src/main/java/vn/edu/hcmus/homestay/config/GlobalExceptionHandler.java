package vn.edu.hcmus.homestay.config;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import vn.edu.hcmus.homestay.common.ApiResponse;
import vn.edu.hcmus.homestay.common.ApiResponseBuilder;
import vn.edu.hcmus.homestay.common.exception.AppException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(ApiResponseBuilder.error(ex.getCode(), ex.getMessage(), ex.getDetails()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex) {
        List<Object> details =
                ex.getBindingResult().getFieldErrors().stream()
                        .map(fe -> (Object) (fe.getField() + ": " + fe.getDefaultMessage()))
                        .toList();
        return ResponseEntity.badRequest()
                .body(ApiResponseBuilder.error("VALIDATION_ERROR", "Validation failed", details));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handlePayloadTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiResponseBuilder.error(
                        "PAYLOAD_TOO_LARGE", "Request body is too large. Current limit is 25MB."));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoHandler(NoHandlerFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseBuilder.error("NOT_FOUND", "Route not found"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex) throws Exception {
        // Let Spring Security's ExceptionTranslationFilter handle access-denied exceptions
        // so it can return the proper 401/403 via the configured entry point / denied handler.
        if (ex instanceof AccessDeniedException) {
            throw ex;
        }
        log.error("Unhandled exception", ex);
        return ResponseEntity.internalServerError()
                .body(ApiResponseBuilder.error("INTERNAL_SERVER_ERROR", "Internal Server Error"));
    }
}
