package vn.edu.hcmus.homestay.adapter.in.web.dto.tenancy;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import vn.edu.hcmus.homestay.domain.model.viewing.ViewingAppointmentStatus;

public class RecordOutcomeRequest {

    @JsonProperty("result_note")
    private String resultNote;

    @NotNull
    private ViewingAppointmentStatus status;

    public String getResultNote() {
        return resultNote;
    }

    public void setResultNote(String resultNote) {
        this.resultNote = resultNote;
    }

    public ViewingAppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(ViewingAppointmentStatus status) {
        this.status = status;
    }
}
