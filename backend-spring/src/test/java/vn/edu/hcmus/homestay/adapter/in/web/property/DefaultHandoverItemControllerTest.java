package vn.edu.hcmus.homestay.adapter.in.web.property;

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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.edu.hcmus.homestay.adapter.in.security.UserPrincipal;
import vn.edu.hcmus.homestay.adapter.out.security.JwtTokenProvider;
import vn.edu.hcmus.homestay.application.port.in.property.GetDefaultHandoverItemUseCase;
import vn.edu.hcmus.homestay.application.port.in.property.ManageDefaultHandoverItemUseCase;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;

@WebMvcTest(DefaultHandoverItemController.class)
@Import(SecurityConfig.class)
class DefaultHandoverItemControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GetDefaultHandoverItemUseCase getDefaultHandoverItemUseCase;

    @MockitoBean
    private ManageDefaultHandoverItemUseCase manageDefaultHandoverItemUseCase;

    @Test
    void listAll_unauthenticated_401() throws Exception {
        mockMvc.perform(get("/api/default-handover-items"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listAll_authenticated_200() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(getDefaultHandoverItemUseCase.listAll()).thenReturn(List.of(defaultHandoverItem()));

        mockMvc.perform(get("/api/default-handover-items")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void create_asCustomer_403() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "customer@example.com", AppRole.CUSTOMER);

        mockMvc.perform(post("/api/default-handover-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"room_type_match\":\"*\",\"item_name\":\"Bed\",\"default_condition\":\"Good\",\"sort_order\":1}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void create_asManager_201() throws Exception {
        UserPrincipal principal = new UserPrincipal(UUID.randomUUID(), "manager@example.com", AppRole.MANAGER);
        when(manageDefaultHandoverItemUseCase.create(any())).thenReturn(defaultHandoverItem());

        mockMvc.perform(post("/api/default-handover-items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"room_type_match\":\"*\",\"item_name\":\"Bed\",\"default_condition\":\"Good\",\"sort_order\":1}")
                        .with(SecurityMockMvcRequestPostProcessors.authentication(
                                new UsernamePasswordAuthenticationToken(
                                        principal, null, principal.getAuthorities()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    private DefaultHandoverItem defaultHandoverItem() {
        return new DefaultHandoverItem(UUID.randomUUID(), "*", "Bed", "Good", 1, true, Instant.now(), Instant.now());
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
