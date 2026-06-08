package vn.edu.hcmus.homestay.common.exception;

public class NotFoundException extends AppException {

    public NotFoundException(String message) {
        super(404, "NOT_FOUND", message);
    }

    public NotFoundException() {
        super(404, "NOT_FOUND", "Not found");
    }
}
