package vn.edu.hcmus.homestay.application.service.property;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
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
import vn.edu.hcmus.homestay.application.port.in.property.CreateBranchUseCase.CreateBranchCommand;
import vn.edu.hcmus.homestay.application.port.in.property.UpdateBranchUseCase.UpdateBranchCommand;
import vn.edu.hcmus.homestay.application.port.out.property.LoadBranchPort;
import vn.edu.hcmus.homestay.application.port.out.property.SaveBranchPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

@ExtendWith(MockitoExtension.class)
class BranchServiceTest {

    @Mock
    private LoadBranchPort loadBranchPort;

    @Mock
    private SaveBranchPort saveBranchPort;

    private BranchService branchService;

    @BeforeEach
    void setUp() {
        branchService = new BranchService(loadBranchPort, saveBranchPort);
    }

    // ── listBranches ──────────────────────────────────────────────────────────

    @Test
    void listBranches_returnsAll() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        when(loadBranchPort.loadAll()).thenReturn(List.of(branch(id1, "Branch A"), branch(id2, "Branch B")));

        List<Branch> result = branchService.listBranches();

        assertThat(result).hasSize(2);
    }

    // ── getBranch ─────────────────────────────────────────────────────────────

    @Test
    void getBranch_found_returnsBranch() {
        UUID id = UUID.randomUUID();
        Branch expected = branch(id, "Branch A");
        when(loadBranchPort.loadById(id)).thenReturn(Optional.of(expected));

        Branch result = branchService.getBranch(id);

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void getBranch_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadBranchPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> branchService.getBranch(id))
                .isInstanceOf(NotFoundException.class);
    }

    // ── createBranch ──────────────────────────────────────────────────────────

    @Test
    void createBranch_newName_saved() {
        UUID id = UUID.randomUUID();
        Branch saved = branch(id, "New Branch");
        when(loadBranchPort.existsByName("New Branch")).thenReturn(false);
        when(saveBranchPort.save(any())).thenReturn(saved);

        Branch result = branchService.createBranch(
                new CreateBranchCommand("New Branch", "123 Street", "0901234567", null, null, null));

        assertThat(result).isEqualTo(saved);
        verify(saveBranchPort).save(any(Branch.class));
    }

    @Test
    void createBranch_duplicateName_throwsConflict() {
        when(loadBranchPort.existsByName("Existing Branch")).thenReturn(true);

        assertThatThrownBy(() -> branchService.createBranch(
                        new CreateBranchCommand("Existing Branch", "123 Street", "0901234567", null, null, null)))
                .isInstanceOf(ConflictException.class);

        verify(saveBranchPort, never()).save(any());
    }

    // ── updateBranch ──────────────────────────────────────────────────────────

    @Test
    void updateBranch_notFound_throwsNotFoundException() {
        UUID id = UUID.randomUUID();
        when(loadBranchPort.loadById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> branchService.updateBranch(
                        id,
                        new UpdateBranchCommand("New Name", null, null, null, null, null)))
                .isInstanceOf(NotFoundException.class);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Branch branch(UUID id, String name) {
        return new Branch(id, name, "123 Street", "0901234567", null, null, null,
                Instant.now(), Instant.now());
    }
}
