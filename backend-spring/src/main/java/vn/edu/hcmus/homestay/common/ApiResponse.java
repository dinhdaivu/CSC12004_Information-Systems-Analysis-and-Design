package vn.edu.hcmus.homestay.common;

import java.util.List;

public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final String message;
    private final ErrorBody error;

    private ApiResponse(boolean success, T data, String message, ErrorBody error) {
        this.success = success;
        this.data = data;
        this.message = message;
        this.error = error;
    }

    static <T> ApiResponse<T> ok(T data, String message) {
        return new ApiResponse<>(true, data, message, null);
    }

    static ApiResponse<Void> fail(String code, String message, List<Object> details) {
        return new ApiResponse<>(false, null, null, new ErrorBody(code, message, details));
    }

    public boolean isSuccess() {
        return success;
    }

    public T getData() {
        return data;
    }

    public String getMessage() {
        return message;
    }

    public ErrorBody getError() {
        return error;
    }

    public record ErrorBody(String code, String message, List<Object> details) {}
}
