package vn.edu.hcmus.homestay.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.application.port.in.CreateBranchUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetBranchUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetZoneUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListBranchesUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListRoomsUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateBranchUseCase;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

@WebMvcTest(BranchController.class)
@Import(SecurityConfig.class)
class BranchControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ListBranchesUseCase listBranchesUseCase;

    @MockitoBean
    private GetBranchUseCase getBranchUseCase;

    @MockitoBean
    private CreateBranchUseCase createBranchUseCase;

    @MockitoBean
    private UpdateBranchUseCase updateBranchUseCase;

    @MockitoBean
    private GetZoneUseCase getZoneUseCase;

    @MockitoBean
    private ListRoomsUseCase listRoomsUseCase;

    @Test
    void listBranches_200() throws Exception {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        when(listBranchesUseCase.listBranches())
                .thenReturn(List.of(branch(id1, "Branch A"), branch(id2, "Branch B")));

        mockMvc.perform(get("/api/branches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getBranch_found_200() throws Exception {
        UUID id = UUID.randomUUID();
        when(getBranchUseCase.getBranch(id)).thenReturn(branch(id, "Branch A"));

        mockMvc.perform(get("/api/branches/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getBranch_notFound_404() throws Exception {
        UUID id = UUID.randomUUID();
        when(getBranchUseCase.getBranch(id)).thenThrow(new NotFoundException("Branch not found"));

        mockMvc.perform(get("/api/branches/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void createBranch_unauthenticated_401() throws Exception {
        mockMvc.perform(
                        post("/api/branches")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {"name":"New Branch","address":"123 Street","phone":"0901234567"}
                                        """))
                .andExpect(status().isUnauthorized());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Branch branch(UUID id, String name) {
        return new Branch(id, name, "123 Street", "0901234567", null, null, null,
                Instant.now(), Instant.now());
    }

    @TestConfiguration
    static class TestSecurityConfig {
        @Primary
        @Bean
        public JwtTokenProvider jwtTokenProvider() {
            return new JwtTokenProvider(SECRET);
        }
    }
}
