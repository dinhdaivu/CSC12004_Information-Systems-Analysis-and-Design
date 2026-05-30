package vn.edu.hcmus.homestay.support;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import tools.jackson.databind.ObjectMapper;

@JsonTest
class ApiResponseSerializationTest {

    @Autowired
    private ObjectMapper mapper;

    @Test
    void successWithDataAndMessageIncludesBoth() throws Exception {
        var response = ApiResponseBuilder.success("hello", "OK");
        var json = mapper.writeValueAsString(response);
        assertThat(json).contains("\"success\":true");
        assertThat(json).contains("\"data\":\"hello\"");
        assertThat(json).contains("\"message\":\"OK\"");
        assertThat(json).doesNotContain("\"error\"");
    }

    @Test
    void successOmitsNullMessage() throws Exception {
        var response = ApiResponseBuilder.success("hello");
        var json = mapper.writeValueAsString(response);
        assertThat(json).doesNotContain("\"message\"");
        assertThat(json).doesNotContain("\"error\"");
    }

    @Test
    void successWithNullDataOmitsDataKey() throws Exception {
        var response = ApiResponseBuilder.success(null, "Logout successful");
        var json = mapper.writeValueAsString(response);
        assertThat(json).doesNotContain("\"data\"");
        assertThat(json).contains("\"message\":\"Logout successful\"");
    }

    @Test
    void errorIncludesCodeAndMessageOmitsData() throws Exception {
        var response = ApiResponseBuilder.error("NOT_FOUND", "Route not found");
        var json = mapper.writeValueAsString(response);
        assertThat(json).contains("\"success\":false");
        assertThat(json).contains("\"code\":\"NOT_FOUND\"");
        assertThat(json).contains("\"message\":\"Route not found\"");
        assertThat(json).doesNotContain("\"data\"");
        assertThat(json).doesNotContain("\"details\"");
    }

    @Test
    void errorWithDetailsIncludesDetailsArray() throws Exception {
        var response = ApiResponseBuilder.error(
                "VALIDATION_ERROR", "Validation failed", List.of("field: required"));
        var json = mapper.writeValueAsString(response);
        assertThat(json).contains("\"details\"");
        assertThat(json).contains("field: required");
    }

    @Test
    void paginatedResponseSerializesCorrectly() throws Exception {
        var pagination = new PaginatedResponse.Pagination(1, 10, 42L, 5);
        var response = new PaginatedResponse<>(List.of("a", "b"), pagination);
        var json = mapper.writeValueAsString(response);
        assertThat(json).contains("\"success\":true");
        assertThat(json).contains("\"total\":42");
        assertThat(json).contains("\"pages\":5");
    }
}
