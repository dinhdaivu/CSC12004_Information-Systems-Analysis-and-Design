package vn.edu.hcmus.homestay.adapter.in.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class SignContractRequest {

    @JsonProperty("contract_document_url")
    private String contractDocumentUrl;

    private String notes;

    public String getContractDocumentUrl() { return contractDocumentUrl; }
    public void setContractDocumentUrl(String contractDocumentUrl) { this.contractDocumentUrl = contractDocumentUrl; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
