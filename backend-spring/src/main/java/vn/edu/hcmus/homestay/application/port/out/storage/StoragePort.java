package vn.edu.hcmus.homestay.application.port.out.storage;

public interface StoragePort {

    /**
     * Uploads a base64-encoded image. Returns the public URL, or null if unconfigured.
     */
    String upload(String base64Data, String folder, String publicIdPrefix);
}
