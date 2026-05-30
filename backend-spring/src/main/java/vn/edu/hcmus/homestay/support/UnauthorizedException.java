package vn.edu.hcmus.homestay.support;

public class UnauthorizedException extends AppException {

    public UnauthorizedException(String message) {
        super(401, "UNAUTHORIZED", message);
    }

    public UnauthorizedException() {
        super(401, "UNAUTHORIZED", "Unauthorized");
    }
}
