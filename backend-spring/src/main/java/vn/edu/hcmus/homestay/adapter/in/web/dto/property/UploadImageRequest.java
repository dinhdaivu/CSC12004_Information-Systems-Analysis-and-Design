package vn.edu.hcmus.homestay.adapter.in.web.dto.property;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UploadImageRequest {

    @JsonProperty("file_data")
    private String fileData;

    public String getFileData() {
        return fileData;
    }

    public void setFileData(String fileData) {
        this.fileData = fileData;
    }
}
