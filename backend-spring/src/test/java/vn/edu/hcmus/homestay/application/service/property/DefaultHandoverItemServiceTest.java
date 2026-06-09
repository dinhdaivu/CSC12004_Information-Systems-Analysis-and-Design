package vn.edu.hcmus.homestay.application.service.property;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
import vn.edu.hcmus.homestay.application.port.in.property.ManageDefaultHandoverItemUseCase.CreateDefaultHandoverItemCommand;
import vn.edu.hcmus.homestay.application.port.in.property.ManageDefaultHandoverItemUseCase.UpdateDefaultHandoverItemCommand;
import vn.edu.hcmus.homestay.application.port.out.property.LoadDefaultHandoverItemPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveDefaultHandoverItemPort;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

@ExtendWith(MockitoExtension.class)
class DefaultHandoverItemServiceTest {

    @Mock
    private LoadDefaultHandoverItemPort loadDefaultHandoverItemPort;

    @Mock
    private SaveDefaultHandoverItemPort saveDefaultHandoverItemPort;

    private DefaultHandoverItemService service;

    @BeforeEach
    void setUp() {
        service = new DefaultHandoverItemService(loadDefaultHandoverItemPort, saveDefaultHandoverItemPort);
    }

    // ── listAll ───────────────────────────────────────────────────────────────

    @Test
    void listAll_returnsList() {
        when(loadDefaultHandoverItemPort.loadAll()).thenReturn(List.of(item(), item()));

        assertThat(service.listAll()).hasSize(2);
    }

    // ── create ────────────────────────────────────────────────────────────────

    @Test
    void create_savesWithDefaultCondition() {
        DefaultHandoverItem saved = item();
        when(saveDefaultHandoverItemPort.save(any())).thenReturn(saved);

        DefaultHandoverItem result = service.create(
                new CreateDefaultHandoverItemCommand("*", "Bed", null, 1));

        verify(saveDefaultHandoverItemPort).save(any(DefaultHandoverItem.class));
        assertThat(result).isEqualTo(saved);
    }

    // ── update ────────────────────────────────────────────────────────────────

    @Test
    void update_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadDefaultHandoverItemPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(id, new UpdateDefaultHandoverItemCommand(null, "Chair", null, 0, null)))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void update_found_savesUpdated() {
        UUID id = UUID.randomUUID();
        DefaultHandoverItem existing = item();
        when(loadDefaultHandoverItemPort.loadById(id)).thenReturn(Optional.of(existing));
        when(saveDefaultHandoverItemPort.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DefaultHandoverItem result = service.update(id,
                new UpdateDefaultHandoverItemCommand(null, "Chair", null, 0, null));

        assertThat(result.getItemName()).isEqualTo("Chair");
    }

    // ── delete ────────────────────────────────────────────────────────────────

    @Test
    void delete_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadDefaultHandoverItemPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(id))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void delete_found_callsDelete() {
        UUID id = UUID.randomUUID();
        when(loadDefaultHandoverItemPort.loadById(id)).thenReturn(Optional.of(item()));

        service.delete(id);

        verify(saveDefaultHandoverItemPort).delete(id);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private DefaultHandoverItem item() {
        return new DefaultHandoverItem(UUID.randomUUID(), "*", "Bed", "Good", 1, true,
                Instant.now(), Instant.now());
    }
}
