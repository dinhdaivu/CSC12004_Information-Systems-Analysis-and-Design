package vn.edu.hcmus.homestay.common.exception;

public class ForbiddenException extends AppException {

    public ForbiddenException(String message) {
        super(403, "FORBIDDEN", message);
    }

    public ForbiddenException() {
        super(403, "FORBIDDEN", "Forbidden");
    }
}
