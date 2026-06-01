package com.readflow.ms1.adapter.out.storage;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.common.policy.RequestRetryOptions;
import com.azure.storage.common.policy.RetryPolicyType;
import com.readflow.ms1.domain.port.out.FileStoragePort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.ByteArrayInputStream;
import java.util.UUID;

@Component
public class AzureBlobStorageAdapter implements FileStoragePort {

    private final BlobContainerClient containerClient;

    public AzureBlobStorageAdapter(
        @Value("${azure.storage.connection-string}") String connectionString,
        @Value("${azure.storage.container-name}") String containerName
    ) {
        RequestRetryOptions retryOptions = new RequestRetryOptions(
            RetryPolicyType.FIXED, 2, 60, null, null, null);
        BlobServiceClient serviceClient = new BlobServiceClientBuilder()
            .connectionString(connectionString)
            .retryOptions(retryOptions)
            .buildClient();
        this.containerClient = serviceClient.getBlobContainerClient(containerName);
    }

    @Override
    public String uploadFile(byte[] data, String fileName, String contentType) {
        String blobName = UUID.randomUUID() + "_" + fileName;
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        blobClient.upload(new ByteArrayInputStream(data), data.length, true);
        if (contentType != null) {
            blobClient.setHttpHeaders(new BlobHttpHeaders().setContentType(contentType));
        }
        return blobClient.getBlobUrl();
    }

    @Override
    public byte[] downloadFile(String fileUrl) {
        String blobName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        BlobClient blobClient = containerClient.getBlobClient(blobName);
        return blobClient.downloadContent().toBytes();
    }
}
