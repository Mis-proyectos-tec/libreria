package com.readflow.ms1.domain.port.out;

public interface FileStoragePort {
    String uploadFile(byte[] data, String fileName, String contentType);
    byte[] downloadFile(String fileUrl);
}
