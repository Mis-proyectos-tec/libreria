package com.readflow.ms1.adapter.in.rest;

import com.readflow.ms1.adapter.in.rest.dto.BookResponseDTO;
import com.readflow.ms1.domain.model.Book;
import com.readflow.ms1.domain.port.in.BookUseCase;
import com.readflow.ms1.domain.port.out.FileStoragePort;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/books")
public class BookController {

    private final BookUseCase bookUseCase;
    private final FileStoragePort fileStorage;

    public BookController(BookUseCase bookUseCase, FileStoragePort fileStorage) {
        this.bookUseCase = bookUseCase;
        this.fileStorage = fileStorage;
    }

    @GetMapping
    public List<BookResponseDTO> getAllBooks() {
        return bookUseCase.getAllBooks().stream()
            .map(BookResponseDTO::from)
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDTO> getBookById(@PathVariable Long id) {
        return bookUseCase.getBookById(id)
            .map(book -> ResponseEntity.ok(BookResponseDTO.from(book)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponseDTO> createBook(
        @RequestParam String userId,
        @RequestParam String title,
        @RequestParam String author,
        @RequestParam String category,
        @RequestParam(required = false) String description,
        @RequestParam(defaultValue = "es") String language,
        @RequestParam(defaultValue = "activo") String currentStatus,
        @RequestParam(defaultValue = "true") Boolean isPublic,
        @RequestParam(required = false) MultipartFile coverFile,
        @RequestParam MultipartFile pdfFile
    ) throws IOException {

        String coverUrl = null;
        if (coverFile != null && !coverFile.isEmpty()) {
            coverUrl = fileStorage.uploadFile(
                coverFile.getBytes(), coverFile.getOriginalFilename(), coverFile.getContentType());
        }

        String pdfUrl = fileStorage.uploadFile(
            pdfFile.getBytes(), pdfFile.getOriginalFilename(), pdfFile.getContentType());

        int totalPages = 0;
        try (PDDocument doc = PDDocument.load(pdfFile.getBytes())) {
            totalPages = doc.getNumberOfPages();
        } catch (Exception ignored) {}

        Book book = new Book(null, userId, title, author, category, description, language,
                             coverUrl, pdfUrl, pdfFile.getOriginalFilename(),
                             pdfFile.getSize(), totalPages, currentStatus, isPublic);

        return ResponseEntity.ok(BookResponseDTO.from(bookUseCase.createBook(book)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BookResponseDTO> updateBook(
        @PathVariable Long id,
        @RequestParam(required = false) String userId,
        @RequestParam(required = false) String title,
        @RequestParam(required = false) String author,
        @RequestParam(required = false) String category,
        @RequestParam(required = false) String description,
        @RequestParam(required = false) String language,
        @RequestParam(required = false) String currentStatus,
        @RequestParam(required = false) Boolean isPublic,
        @RequestParam(required = false) MultipartFile coverFile,
        @RequestParam(required = false) MultipartFile pdfFile
    ) throws IOException {

        Book updates = new Book();
        updates.setUserId(userId);
        updates.setTitle(title);
        updates.setAuthor(author);
        updates.setCategory(category);
        updates.setDescription(description);
        updates.setLanguage(language);
        updates.setCurrentStatus(currentStatus);
        updates.setIsPublic(isPublic);

        if (coverFile != null && !coverFile.isEmpty()) {
            updates.setCoverUrl(fileStorage.uploadFile(
                coverFile.getBytes(), coverFile.getOriginalFilename(), coverFile.getContentType()));
        }

        if (pdfFile != null && !pdfFile.isEmpty()) {
            updates.setPdfUrl(fileStorage.uploadFile(
                pdfFile.getBytes(), pdfFile.getOriginalFilename(), pdfFile.getContentType()));
            updates.setPdfFileName(pdfFile.getOriginalFilename());
            updates.setPdfFileSize(pdfFile.getSize());
            try (PDDocument doc = PDDocument.load(pdfFile.getBytes())) {
                updates.setTotalPages(doc.getNumberOfPages());
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(BookResponseDTO.from(bookUseCase.updateBook(id, updates)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookUseCase.deleteBook(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<?> getBookPdf(@PathVariable Long id) {
        return bookUseCase.getBookById(id)
            .map(book -> {
                try {
                    byte[] pdfBytes = fileStorage.downloadFile(book.getPdfUrl());
                    return ResponseEntity.ok()
                        .header("Content-Type", "application/pdf")
                        .header("Content-Disposition", "inline; filename=\"" + book.getPdfFileName() + "\"")
                        .body(pdfBytes);
                } catch (Exception e) {
                    return ResponseEntity.status(500).body("Error al descargar PDF: " + e.getMessage());
                }
            })
            .orElse(ResponseEntity.notFound().build());
    }
}
