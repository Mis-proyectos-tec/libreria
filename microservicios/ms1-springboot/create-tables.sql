-- Create Categories table
CREATE TABLE categories (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255),
    label NVARCHAR(255)
);

-- Create Books table
CREATE TABLE books (
    id BIGINT PRIMARY KEY IDENTITY(1,1),
    user_id NVARCHAR(255),
    title NVARCHAR(255),
    author NVARCHAR(255),
    category NVARCHAR(255),
    description NVARCHAR(MAX),
    language NVARCHAR(255),
    cover_url NVARCHAR(1000),
    pdf_url NVARCHAR(1000),
    pdf_file_name NVARCHAR(255),
    pdf_file_size BIGINT,
    total_pages INT,
    current_status NVARCHAR(255),
    is_public BIT
);
