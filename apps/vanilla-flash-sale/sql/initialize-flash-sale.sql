CREATE TABLE IF NOT EXISTS flash_sale_items (
                                                id SERIAL PRIMARY KEY,
                                                item_name VARCHAR(255) NOT NULL,
                                                quantity INT NOT NULL,
                                                version INT NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS purchase_logs (
                                             id SERIAL PRIMARY KEY,
                                             item_id INT NOT NULL,
                                             quantity INT NOT NULL,
                                             purchase_time TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchase_logs_item_id ON purchase_logs (item_id);


INSERT INTO flash_sale_items (item_name, quantity, version) VALUES
                                                                ('Item A', 100, 0),
                                                                ('Item B', 200, 0),
                                                                ('Item C', 150, 0),
                                                                ('Item D', 300, 0),
                                                                ('Item E', 250, 0);

CREATE INDEX idx_flash_sale_items_id ON flash_sale_items (id);
