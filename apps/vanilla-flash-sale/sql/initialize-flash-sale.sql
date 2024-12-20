CREATE TABLE IF NOT EXISTS flash_sale_items (
                                                id SERIAL PRIMARY KEY,
                                                item_name VARCHAR(255) NOT NULL,
                                                quantity INT NOT NULL CHECK (quantity >= 0),
                                                version INT NOT NULL DEFAULT 0,
                                                last_updated TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO flash_sale_items (item_name, quantity, version) VALUES
                                                                ('Item A', 100, 0),
                                                                ('Item B', 200, 0),
                                                                ('Item C', 150, 0),
                                                                ('Item D', 300, 0),
                                                                ('Item E', 250, 0);

CREATE INDEX idx_flash_sale_items_id ON flash_sale_items (id);


CREATE INDEX idx_flash_sale_items_quantity ON flash_sale_items (quantity);


CREATE TABLE IF NOT EXISTS purchase_logs (
                                             id SERIAL PRIMARY KEY,
                                             item_id INT NOT NULL REFERENCES flash_sale_items(id) ON DELETE CASCADE,
                                             user_id INT NOT NULL,
                                             quantity INT NOT NULL,
                                             purchase_time TIMESTAMP NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (purchase_time);


CREATE TABLE IF NOT EXISTS users (
                                     id SERIAL PRIMARY KEY,
                                     username VARCHAR(255) NOT NULL UNIQUE,
                                     email VARCHAR(255) NOT NULL UNIQUE,
                                     created_at TIMESTAMP NOT NULL DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS user_purchases (
                                              id SERIAL PRIMARY KEY,
                                              user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                              item_id INT NOT NULL REFERENCES flash_sale_items(id) ON DELETE CASCADE,
                                              quantity INT NOT NULL,
                                              created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                                              CONSTRAINT unique_user_item UNIQUE (user_id, item_id)
);







