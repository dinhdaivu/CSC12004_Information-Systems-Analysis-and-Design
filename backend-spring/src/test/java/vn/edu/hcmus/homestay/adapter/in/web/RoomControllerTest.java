package vn.edu.hcmus.homestay.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
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
import vn.edu.hcmus.homestay.application.port.in.CreateRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.DeleteRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetBedUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetRoomUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListRoomsUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateRoomUseCase;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.config.SecurityConfig;
import vn.edu.hcmus.homestay.domain.model.room.Room;
import vn.edu.hcmus.homestay.domain.model.room.RoomStatus;

@WebMvcTest(RoomController.class)
@Import(SecurityConfig.class)
class RoomControllerTest {

    private static final String SECRET = "change-me-to-a-real-secret-at-least-32-chars";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ListRoomsUseCase listRoomsUseCase;

    @MockitoBean
    private GetRoomUseCase getRoomUseCase;

    @MockitoBean
    private CreateRoomUseCase createRoomUseCase;

    @MockitoBean
    private UpdateRoomUseCase updateRoomUseCase;

    @MockitoBean
    private DeleteRoomUseCase deleteRoomUseCase;

    @MockitoBean
    private GetBedUseCase getBedUseCase;

    @Test
    void listRooms_publicEndpoint_200() throws Exception {
        when(listRoomsUseCase.listRooms(any(ListRoomsUseCase.RoomFilter.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getRoom_found_200() throws Exception {
        UUID id = UUID.randomUUID();
        when(getRoomUseCase.getRoom(id)).thenReturn(room(id));

        mockMvc.perform(get("/api/rooms/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getRoom_notFound_404() throws Exception {
        UUID id = UUID.randomUUID();
        when(getRoomUseCase.getRoom(id)).thenThrow(new NotFoundException("Room not found"));

        mockMvc.perform(get("/api/rooms/{id}", id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("NOT_FOUND"));
    }

    @Test
    void createRoom_unauthenticated_401() throws Exception {
        mockMvc.perform(
                        post("/api/rooms")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        """
                                        {"branchId":"00000000-0000-0000-0000-000000000001","roomNumber":"101","roomType":"SINGLE","maxCapacity":2,"pricePerMonth":3000000}
                                        """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteRoom_unauthenticated_401() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete("/api/rooms/{id}", id))
                .andExpect(status().isUnauthorized());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Room room(UUID id) {
        return new Room(id, UUID.randomUUID(), "101", "SINGLE", 2, BigDecimal.valueOf(3000000),
                List.of(), List.of(), RoomStatus.AVAILABLE, Instant.now(), Instant.now());
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
