package vn.edu.hcmus.homestay.support;

public class ConflictException extends AppException {

    public ConflictException(String message) {
        super(409, "CONFLICT", message);
    }

    public ConflictException() {
        super(409, "CONFLICT", "Conflict");
    }
}
