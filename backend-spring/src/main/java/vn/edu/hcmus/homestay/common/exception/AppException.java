package vn.edu.hcmus.homestay.common.exception;

import java.util.List;

public class AppException extends RuntimeException {

    private final int statusCode;
    private final String code;
    private final List<Object> details;

    public AppException(int statusCode, String code, String message) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = null;
    }

    public AppException(int statusCode, String code, String message, List<Object> details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public String getCode() {
        return code;
    }

    public List<Object> getDetails() {
        return details;
    }
}
