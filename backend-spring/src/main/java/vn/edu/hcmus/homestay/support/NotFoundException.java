package vn.edu.hcmus.homestay.support;

public class NotFoundException extends AppException {

    public NotFoundException(String message) {
        super(404, "NOT_FOUND", message);
    }

    public NotFoundException() {
        super(404, "NOT_FOUND", "Not found");
    }
}
