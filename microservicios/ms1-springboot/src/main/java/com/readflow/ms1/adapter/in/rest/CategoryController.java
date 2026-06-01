package com.readflow.ms1.adapter.in.rest;

import com.readflow.ms1.domain.model.Category;
import com.readflow.ms1.domain.port.in.CategoryUseCase;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryUseCase categoryUseCase;

    public CategoryController(CategoryUseCase categoryUseCase) {
        this.categoryUseCase = categoryUseCase;
    }

    @GetMapping
    public List<Category> getAllCategories() {
        return categoryUseCase.getAllCategories();
    }
}
