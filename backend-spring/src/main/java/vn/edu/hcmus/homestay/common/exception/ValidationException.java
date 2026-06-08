package vn.edu.hcmus.homestay.common.exception;

import java.util.List;

public class ValidationException extends AppException {

    public ValidationException(String message) {
        super(400, "VALIDATION_ERROR", message);
    }

    public ValidationException(String message, List<Object> details) {
        super(400, "VALIDATION_ERROR", message, details);
    }
}
