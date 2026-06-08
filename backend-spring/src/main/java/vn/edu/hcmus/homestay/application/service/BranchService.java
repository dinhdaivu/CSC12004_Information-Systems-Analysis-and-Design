package vn.edu.hcmus.homestay.application.service;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import vn.edu.hcmus.homestay.application.port.in.CreateBranchUseCase;
import vn.edu.hcmus.homestay.application.port.in.GetBranchUseCase;
import vn.edu.hcmus.homestay.application.port.in.ListBranchesUseCase;
import vn.edu.hcmus.homestay.application.port.in.UpdateBranchUseCase;
import vn.edu.hcmus.homestay.application.port.out.LoadBranchPort;
import vn.edu.hcmus.homestay.application.port.out.SaveBranchPort;
import vn.edu.hcmus.homestay.common.exception.ConflictException;
import vn.edu.hcmus.homestay.common.exception.NotFoundException;
import vn.edu.hcmus.homestay.domain.model.branch.Branch;

@Service
public class BranchService
        implements ListBranchesUseCase, GetBranchUseCase, CreateBranchUseCase, UpdateBranchUseCase {

    private final LoadBranchPort loadBranchPort;
    private final SaveBranchPort saveBranchPort;

    public BranchService(LoadBranchPort loadBranchPort, SaveBranchPort saveBranchPort) {
        this.loadBranchPort = loadBranchPort;
        this.saveBranchPort = saveBranchPort;
    }

    @Override
    public List<Branch> listBranches() {
        return loadBranchPort.loadAll();
    }

    @Override
    public Branch getBranch(UUID id) {
        return loadBranchPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Branch not found"));
    }

    @Override
    public Branch createBranch(CreateBranchCommand command) {
        if (loadBranchPort.existsByName(command.name())) {
            throw new ConflictException("A branch with this name already exists");
        }
        Branch branch = new Branch(
                null,
                command.name(),
                command.address(),
                command.phone(),
                command.description(),
                command.heroImageUrl(),
                command.managerId(),
                null,
                null);
        return saveBranchPort.save(branch);
    }

    @Override
    public Branch updateBranch(UUID id, UpdateBranchCommand command) {
        Branch existing = loadBranchPort
                .loadById(id)
                .orElseThrow(() -> new NotFoundException("Branch not found"));

        if (command.name() != null
                && !command.name().equals(existing.getName())
                && loadBranchPort.existsByName(command.name())) {
            throw new ConflictException("A branch with this name already exists");
        }

        Branch updated = new Branch(
                existing.getId(),
                command.name() != null ? command.name() : existing.getName(),
                command.address() != null ? command.address() : existing.getAddress(),
                command.phone() != null ? command.phone() : existing.getPhone(),
                command.description() != null ? command.description() : existing.getDescription(),
                command.heroImageUrl() != null ? command.heroImageUrl() : existing.getHeroImageUrl(),
                command.managerId() != null ? command.managerId() : existing.getManagerId(),
                existing.getCreatedAt(),
                existing.getUpdatedAt());
        return saveBranchPort.save(updated);
    }
}
