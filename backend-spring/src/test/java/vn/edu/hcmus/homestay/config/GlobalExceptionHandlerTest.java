package vn.edu.hcmus.homestay.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.hcmus.homestay.application.service.AuthService;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.ForbiddenException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.common.exception.UnauthorizedException;
import vn.edu.hcmus.homestay.common.exception.ValidationException;

@WebMvcTest
@Import(GlobalExceptionHandlerTest.StubController.class)
@WithMockUser
class GlobalExceptionHandlerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    AuthService authService;

    @RestController
    static class StubController {

        record Body(@NotBlank String name) {}

        @GetMapping("/stub/validation")
        void throwValidation() {
            throw new ValidationException("bad input");
        }

        @GetMapping("/stub/unauthorized")
        void throwUnauthorized() {
            throw new UnauthorizedException("Invalid or missing authentication token");
        }

        @GetMapping("/stub/forbidden")
        void throwForbidden() {
            throw new ForbiddenException("Access denied");
        }

        @GetMapping("/stub/not-found")
        void throwNotFound() {
            throw new NotFoundException("Resource not found");
        }

        @GetMapping("/stub/conflict")
        void throwConflict() {
            throw new ConflictException("Already exists");
        }

        @PostMapping("/stub/bean-validation")
        void beanValidation(@Valid @RequestBody Body body) {}
    }

    @Test
    void validationErrorReturns400() throws Exception {
        mockMvc.perform(get("/stub/validation"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    @Test
    void unauthorizedReturns401() throws Exception {
        mockMvc.perform(get("/stub/unauthorized"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("UNAUTHORIZED"));
    }

    @Test
    void forbiddenReturns403() throws Exception {
        mockMvc.perform(get("/stub/forbidden"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error.code").value("FORBIDDEN"));
    }

    @Test
    void notFoundReturns404() throws Exception {
        mockMvc.perform(get("/stub/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void conflictReturns409() throws Exception {
        mockMvc.perform(get("/stub/conflict"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("CONFLICT"));
    }

    @Test
    void beanValidationFailureReturns400WithDetails() throws Exception {
        mockMvc.perform(
                        post("/stub/bean-validation")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.error.details").isArray());
    }

    @Test
    void unmappedRouteReturns404() throws Exception {
        mockMvc.perform(get("/no-such-route"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }
}
