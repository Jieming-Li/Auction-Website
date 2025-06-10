drop table bids;
drop table listings;

CREATE TABLE listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    end_time TIMESTAMP NOT NULL
);

CREATE TABLE bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    name VARCHAR(255),
    bid_amount FLOAT NOT NULL,
    comment TEXT,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);

INSERT INTO listings (id, title, image_url, description, category, end_time)
VALUES
(1, 'Signed New York Yankees Team Ball', 'https://static.wixstatic.com/media/e28f47_ca4bff6662bd40078ca9dacf76950810~mv2.jpg/v1/crop/x_0,y_71,w_652,h_379/fill/w_626,h_364,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Babe%20Ruth%20Baseball.jpg', '1932 Signed New York Yankees Team Ball with 15 Signatures Including Babe Ruth.', 'souvenir', '2024-12-15 14:30:00'),
(2, 'Tete-a-Tete Sofa', 'https://static.wixstatic.com/media/e28f47_90f5bb87f72a4142972e7b41f2feabca~mv2.jpg/v1/fill/w_626,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Dunbar%20Sofa.jpg', 'Rare Dunbar Tete-a-Tete Sofa', 'furniture', '2024-12-31 23:59:59'),
(3, 'Edouard Cortes Oil on Canvas', 'https://static.wixstatic.com/media/e28f47_25fa4d4153f4451282bbe5fc702f0fe6~mv2.jpg/v1/fill/w_455,h_402,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Cortes%20Oil.jpg', 'Edouard Cortes Oil on Canvas', 'painting', '2025-01-05 08:15:00'),
(4, 'Music Box', 'https://static.wixstatic.com/media/e28f47_8938be96dad34084a4c18c410b9d95ca~mv2.jpg/v1/fill/w_163,h_394,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Polyphon%20Music%20Box.jpg', 'Polyphon Upright Coin-Op Music Box', 'souvenir', '2025-02-14 19:00:00');

INSERT INTO bids (listing_id, name, bid_amount, comment)
VALUES
(1, 'John Wick', 1.00, ''),
(1, 'Art Lover', 4500.00, 'I want this.'),
(1, 'Jimmy Li', 7000.00, 'What a stunning ball!'),

(2, 'Sofa Lover', 500.00, 'I want this.'),
(2, 'Johny Smith', 1000.00, ''),
(2, 'Jimmy Li', 3200.00, 'What a stunning couch!'),

(3, 'David H. Pumpkin', 1000.00, ''),
(3, 'Oiloncanvas Lover', 10000.00, 'I want this.'),
(3, 'Jimmy Li', 27000.00, 'What a stunning piece of art work!'),

(4, 'Music Lover', 1000.00, 'I want this.'),
(4, 'Clayton Bigsby', 1001.00, ''),
(4, 'Jimmy Li', 4600.00, 'What a stunning music box!');
