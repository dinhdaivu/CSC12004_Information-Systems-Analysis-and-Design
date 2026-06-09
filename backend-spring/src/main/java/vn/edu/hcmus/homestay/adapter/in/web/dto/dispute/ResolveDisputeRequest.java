package vn.edu.hcmus.homestay.adapter.in.web.dto.dispute;

import jakarta.validation.constraints.NotNull;
import vn.edu.hcmus.homestay.domain.model.dispute.DisputeStatus;

public class ResolveDisputeRequest {

    @NotNull
    private DisputeStatus status;

    private String resolutionNote;

    public DisputeStatus getStatus() {
        return status;
    }

    public void setStatus(DisputeStatus status) {
        this.status = status;
    }

    public String getResolutionNote() {
        return resolutionNote;
    }

    public void setResolutionNote(String resolutionNote) {
        this.resolutionNote = resolutionNote;
    }
}
