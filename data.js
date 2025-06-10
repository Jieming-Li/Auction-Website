// this package behaves just like the mysql one, but uses async await instead of callbacks.
const mysql = require(`mysql-await`); // npm install mysql-await

// first -- I want a connection pool: https://www.npmjs.com/package/mysql#pooling-connections
// this is used a bit differently, but I think it's just better -- especially if server is doing heavy work.
var connPool = mysql.createPool({
  connectionLimit: 5, // it's a shared resource, let's not go nuts.
  // host: "127.0.0.1",// this will work
  host: "cse-mysql-classes-01.cse.umn.edu",
  user: "C4131F24U75",
  database: "C4131F24U75",
  password: "5675", // we really shouldn't be saving this here long-term -- and I probably shouldn't be sharing it with you...
});

// later you can use connPool.awaitQuery(query, data) -- it will return a promise for the query results.

async function addListing(data) {
  const {title, imageUrl, description, category, endDate} = data;
  // you CAN change the parameters for this function.
  const query = "INSERT INTO listings (title, image_url, description, category, end_time) VALUES (?, ?, ?, ?, ?);"
  const result = await connPool.awaitQuery(query, [title, imageUrl, description, category, endDate]);
  const newListingId = result.insertId;
  console.log("Listing added with ID:", newListingId);
  return newListingId;
}

async function deleteListing(id) {
  const result = await connPool.awaitQuery("DELETE FROM listings WHERE id = ?", [id]);
  const result2 = await connPool.awaitQuery("DELETE FROM bids WHERE listing_id = ?", [id]);
  const isDeleted = result.affectedRows > 0;
  if (isDeleted) {
    console.log(`Listing with ID ${id} deleted.`);
  } else {
    console.log(`Listing with ID ${id} not found.`);
  }
  return isDeleted;
}

async function getListing(id) {
  const listingResult = await connPool.awaitQuery("SELECT * from listings where id = ?",[id]);
  
  const query = "SELECT name, bid_amount, comment FROM bids WHERE listing_id = ? ORDER BY bid_amount DESC, id DESC";
  const bidsResult = await connPool.awaitQuery(query, [id]);
  
  //Combine
  const listing = {
    id: listingResult[0].id,
    title: listingResult[0].title,
    imageUrl: listingResult[0].image_url,
    description: listingResult[0].description,
    category: listingResult[0].category,
    endDate: listingResult[0].end_time,
    bids: bidsResult.map(bid => ({
      name: bid.name,
      bidAmount: bid.bid_amount,
      comment: bid.comment
    }))
  };
  
  return listing;
}

async function getGallery(query, category) {
  let sql = "";
  let params = [];
  if (category === "") {
    category = "all categories";
  }

  if (query === "" && category === "all categories") {
    sql = "SELECT * FROM listings";
  }
  else if (query !== "" && category === "all categories") {
    sql = "SELECT * FROM listings WHERE title LIKE ?";
    params = [`%${query}%`];
  }
  else if (query === "" && category !== "all categories") {
    sql = "SELECT * FROM listings WHERE category = ?";
    params = [category];
  }
  else if (query !== "" && category !== "all categories") {
    sql = "SELECT * FROM listings WHERE title LIKE ? AND category = ?";
    params = [`%${query}%`, category];
  }

  const result = await connPool.awaitQuery(sql, params);
  return result;
}

async function placeBid(data) {
  // you CAN change the parameters for this function.
    const { listing_id, bidder, amount, comment } = data;

    const query = "INSERT INTO bids (listing_id, name, bid_amount, comment) VALUES (?, ?, ?, ?)";
    const result = await connPool.awaitQuery(query, [listing_id, bidder, amount, comment]);
    return result;
}

async function getBids(listing_id) {
  const bids = await connPool.awaitQuery("SELECT * FROM bids WHERE listing_id = ? ORDER BY id ASC", [listing_id]);
  return bids.map(bid => ({
    name: bid.name,
    bidAmount: bid.bid_amount,
    comment: bid.comment
  }));
}

async function getHighestBid(listing_id) {
  const result = await connPool.awaitQuery("SELECT MAX(bid_amount) AS highest_bid FROM bids WHERE listing_id = ?", [listing_id]);
  return result[0].highest_bid;
}

module.exports = {
    addListing,
    deleteListing,
    getListing,
    getGallery,
    placeBid,
    getBids,
    getHighestBid
};