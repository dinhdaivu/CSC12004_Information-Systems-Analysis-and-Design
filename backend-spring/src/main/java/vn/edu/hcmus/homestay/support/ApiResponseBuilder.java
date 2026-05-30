package vn.edu.hcmus.homestay.support;

import java.util.List;

public final class ApiResponseBuilder {

    private ApiResponseBuilder() {}

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.ok(data, null);
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.ok(data, message);
    }

    public static ApiResponse<Void> error(String code, String message) {
        return ApiResponse.fail(code, message, null);
    }

    public static ApiResponse<Void> error(String code, String message, List<Object> details) {
        return ApiResponse.fail(code, message, details);
    }
}
