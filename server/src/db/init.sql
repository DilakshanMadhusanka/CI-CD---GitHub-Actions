-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial sample data if table is empty
INSERT INTO tasks (title, description, completed)
SELECT 'Setup PERN Stack', 'PostgreSQL, Express, React, Node.js configuration', true
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Setup PERN Stack');

INSERT INTO tasks (title, description, completed)
SELECT 'Configure GitHub Actions', 'Implement automated CI/CD pipeline for testing and deployment', false
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Configure GitHub Actions');

INSERT INTO tasks (title, description, completed)
SELECT 'Deploy Application', 'Deploy Dockerized containers to target environment', false
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'Deploy Application');
