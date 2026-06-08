package vn.edu.hcmus.homestay.common.exception;

public class UnauthorizedException extends AppException {

    public UnauthorizedException(String message) {
        super(401, "UNAUTHORIZED", message);
    }

    public UnauthorizedException() {
        super(401, "UNAUTHORIZED", "Unauthorized");
    }
}
