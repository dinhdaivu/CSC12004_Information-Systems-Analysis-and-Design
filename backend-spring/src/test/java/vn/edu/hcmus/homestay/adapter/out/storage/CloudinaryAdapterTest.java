package vn.edu.hcmus.homestay.adapter.out.storage;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class CloudinaryAdapterTest {

    @Test
    void upload_whenNotConfigured_returnsNull() {
        CloudinaryAdapter adapter = new CloudinaryAdapter();
        ReflectionTestUtils.setField(adapter, "cloudName", "");
        ReflectionTestUtils.setField(adapter, "apiKey", "");
        ReflectionTestUtils.setField(adapter, "apiSecret", "");

        String result = adapter.upload("data:image/jpeg;base64,abc123", "test-folder", "test-prefix");

        assertThat(result).isNull();
    }

    @Test
    void upload_whenPartiallyConfigured_returnsNull() {
        CloudinaryAdapter adapter = new CloudinaryAdapter();
        ReflectionTestUtils.setField(adapter, "cloudName", "my-cloud");
        ReflectionTestUtils.setField(adapter, "apiKey", "");
        ReflectionTestUtils.setField(adapter, "apiSecret", "my-secret");

        String result = adapter.upload("data:image/jpeg;base64,abc123", "test-folder", null);

        assertThat(result).isNull();
    }
}
