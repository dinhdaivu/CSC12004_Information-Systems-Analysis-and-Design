package vn.edu.hcmus.homestay.application.service.property;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.edu.hcmus.homestay.application.port.out.property.LoadZonePort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.zone.Zone;

@ExtendWith(MockitoExtension.class)
class ZoneServiceTest {

    @Mock
    private LoadZonePort loadZonePort;

    private ZoneService service;

    @BeforeEach
    void setUp() {
        service = new ZoneService(loadZonePort);
    }

    @Test
    void getZone_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadZonePort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getZone(id))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getZone_found_returnsZone() {
        UUID id = UUID.randomUUID();
        Zone z = zone(id);
        when(loadZonePort.loadById(id)).thenReturn(Optional.of(z));

        assertThat(service.getZone(id)).isEqualTo(z);
    }

    @Test
    void listZonesByBranch_returnsList() {
        UUID branchId = UUID.randomUUID();
        when(loadZonePort.loadByBranchId(branchId)).thenReturn(List.of(zone(UUID.randomUUID()), zone(UUID.randomUUID())));

        assertThat(service.listZonesByBranch(branchId)).hasSize(2);
    }

    private Zone zone(UUID id) {
        return new Zone(id, UUID.randomUUID(), "Zone A", Instant.now(), Instant.now());
    }
}
