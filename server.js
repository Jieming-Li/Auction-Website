const data = require("./data")

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const app = express();

app.use("/css", express.static("resources/css/"));
app.use("/js", express.static("resources/js/"));
app.use('/images', express.static('resources/images'));
app.use(express.json());
app.set("views", "templates");
app.set("view engine", "pug");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const port = 4131;

const loggerMiddleware = (req, res, next) => {
    res.on('finish', () => {
        const method = req.method;
        const url = req.originalUrl;
        const statusCode = res.statusCode;

        console.log(`${method} ${url} - Status: ${statusCode}`);
    });

    next();
};

app.use(loggerMiddleware);

// Rate limiting setup
let rateLimitStore = [];
const RATE_LIMIT = 3; // requests per second
const RATE_LIMIT_WINDOW = 10; // seconds

const checkRateLimit = () => {
  const now = new Date();
  rateLimitStore = rateLimitStore.filter(time =>
    (now - time) <= RATE_LIMIT_WINDOW * 1000
  );

  if (rateLimitStore.length >= RATE_LIMIT) {
    const oldestRequest = rateLimitStore[0];
    const retryAfter = RATE_LIMIT_WINDOW - ((now - oldestRequest) / 1000);
    return { passed: false, retryAfter };
  }

  rateLimitStore.push(now);
  return { passed: true };
};

// const listings = [
//     {
//       title: "Signed New York Yankees Team Ball",
//       imageUrl:
//         "https://static.wixstatic.com/media/e28f47_ca4bff6662bd40078ca9dacf76950810~mv2.jpg/v1/crop/x_0,y_71,w_652,h_379/fill/w_626,h_364,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Babe%20Ruth%20Baseball.jpg",
//       description: "1932 Signed New York Yankees Team Ball with 15 Signatures Including Babe Ruth.",
//       category: "souvenir",
//       ID: 1,
//       endDate: "2024-11-28",
//       bids: [
//         { name: "", bidAmount: "0", comment: "" },
//         { name: "John Wick", bidAmount: "1.00", comment: "" },
//         { name: "Art Lover", bidAmount: "4,500.00", comment: "I want this." },
//         { name: "Jimmy Li", bidAmount: "7,000.00", comment: "What a stunning ball!" }
//       ]
//     },
//     {
//       title: "Tete-a-Tete Sofa",
//       imageUrl:
//         "https://static.wixstatic.com/media/e28f47_90f5bb87f72a4142972e7b41f2feabca~mv2.jpg/v1/fill/w_626,h_250,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Dunbar%20Sofa.jpg",
//       description: "Rare Dunbar Tete-a-Tete Sofa",
//       category: "furniture",
//       ID: 2,
//       endDate: "2024-10-18",
//       bids: [
//         { name: "", bidAmount: "0", comment: "" },
//         { name: "Sofa Lover", bidAmount: "500.00", comment: "I want this." },
//         { name: "Johny Smith", bidAmount: "1,000.00", comment: "" },
//         { name: "Jimmy Li", bidAmount: "3,200.00", comment: "What a stunning couch!" }
//       ]
//     },
//     {
//       title: "Edouard Cortes Oil on Canvas",
//       imageUrl:
//         "https://static.wixstatic.com/media/e28f47_25fa4d4153f4451282bbe5fc702f0fe6~mv2.jpg/v1/fill/w_455,h_402,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Cortes%20Oil.jpg",
//       description: "Edouard Cortes Oil on Canvas",
//       category: "painting",
//       ID: 3,
//       endDate: "2024-10-27",
//       bids: [
//         { name: "", bidAmount: "0", comment: "" },
//         { name: "David H. Pumpkin", bidAmount: "1,000.00", comment: "" },
//         { name: "Oiloncanvas Lover", bidAmount: "10,000.00", comment: "I want this." },
//         { name: "Jimmy Li", bidAmount: "27,000.00", comment: "What a stunning piece of art work!" }
//       ]
//     },
//     {
//       title: "Music Box",
//       imageUrl:
//         "https://static.wixstatic.com/media/e28f47_8938be96dad34084a4c18c410b9d95ca~mv2.jpg/v1/fill/w_163,h_394,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Polyphon%20Music%20Box.jpg",
//       description: "Polyphon Upright Coin-Op Music Box",
//       category: "souvenir",
//       ID: 4,
//       endDate: "2024-11-01",
//       bids: [
//         { name: "", bidAmount: "0", comment: "" },
//         { name: "Music Lover", bidAmount: "1,000.00", comment: "I want this." },
//         { name: "Clayton Bigsby", bidAmount: "1,001.00", comment: "" },
//         { name: "Jimmy Li", bidAmount: "4,600.00", comment: "What a stunning music box!" }
//       ]
//     }
//   ];

app.use('/api', (req, res, next) => {
    const {passed, retryAfter} = checkRateLimit();

    if (!passed) { 
        res.setHeader('Retry-After', retryAfter);
        return res.status(429).send('Too Many Requests');
    }

    next();
});

app.get(['/', '/main'], (req , res) => {
    res.status(200).render('mainpage.pug');
});

app.get('/gallery', async (req, res) => {
    let query = req.query.query || "";
    let category = req.query.category || "";

    // let newListings = [];

    // if (query === "" && category === "") {
    //     newListings = listings;
    // } else {
    //     newListings = listings.filter(listing => {
    //         const matchesQuery = listing.title.includes(query);
    //         const matchesCategory = category === "all categories" || category === listing.category;
    //         return matchesQuery && matchesCategory;
    //     });
    // }

    const newListings = await data.getGallery(query, category);

    const listingsWithBids = [];
    for (const listing of newListings) {
        const listingWithBids = await data.getListing(listing.id);
        listingsWithBids.push(listingWithBids);
    }

    // const noResults = newListings.length === 0;
    res.status(200).render('gallery', {listings: listingsWithBids});
});

app.get('/listing/:id', async (req, res) => {
    const listingId = parseInt(req.params.id, 10);
    const bidderName = req.cookies['bidderName'];
  
    if (isNaN(listingId)) {
      res.status(404).render('404.pug');
      return;
    }
  
    // const listing = listings.find((item) => item.ID === listingId);
    const listing = await data.getListing(listingId);
  
    if (listing) {
      res.status(200).render('listings.pug', {"item":listing, "bidderName":bidderName});
    } else {
      res.status(404).render('404.pug');
    }
});

app.get('/bid', (req , res) => {
    res.sendFile('bid.js', { root: './resources/js' });
});

app.get('/table', (req , res) => {
    res.sendFile('table.js', { root: './resources/js' });
});

app.get('/new_listing', (req , res) => {
    res.sendFile('new_listing.js', { root: './resources/js' });
});

app.get('/banner', (req , res) => {
    res.sendFile('banner.js', { root: './resources/js' });
});

app.get('/create', (req, res) => {
    res.status(200).render('create.pug');
});

app.post('/create', (req, res) => {
    const listing_data = req.body;

    const success = addNewListing(listing_data);

    if (success) {
        res.status(200).render('success.pug');
    } else {
        res.status(400).render('fail.pug');
    }
});

async function addNewListing(listing_data) {
    const requiredFields = ['title', 'imageUrl', 'description', 'category', 'endDate'];

    for (const field of requiredFields) {
        if (!listing_data[field] || listing_data[field].trim() === '') {
            console.log('Missing or empty field:', field);
            return false;
        }
    }

    const saleEndDate = new Date(listing_data['endDate']);
    if (saleEndDate < new Date()) {
        console.log('Sale end date is in the past');
        return false;
    }

    if (listing_data['category'] === 'other' && (!listing_data['otherCategoryInput'] || listing_data['otherCategoryInput'].trim() === '')) {
        console.log('Other category requires an additional input');
        return false;
    }

    // const newId = listings.length + 1;
    // listing_data['ID'] = newId;
    // listing_data['bids'] = [{ name: '', bidAmount: '0', comment: '' }];
    // listings.push(listing_data);
    if (listing_data['category'] === 'other') {
        listing_data['category'] = listing_data['otherCategoryInput'];
    }
    delete listing_data.otherCategoryInput;
    let isoString = listing_data['endDate'] + "T00:00:00Z";
    listing_data['endDate'] = isoString.replace("T", " ").replace("Z", "");
    const id = data.addListing(listing_data);

    return true;
}

async function addNewBid(bid_data) {
    if (typeof bid_data !== 'object') {
      return 400;
    }
  
    const requiredFields = ['auctionId', 'bidderName', 'bidAmount', 'bidComment'];
  
    for (const field of requiredFields) {
        if (!bid_data.hasOwnProperty(field) || !bid_data[field]) {
            return 400;
        }
    }
  
    if (typeof bid_data['bidderName'] !== 'string' || (typeof bid_data['bidAmount'] !== 'number')) {
      return 400;
    }
  
    // const listingId = parseInt(bid_data['auctionId'], 10);
    // if (listingId <= 0 || listingId > listings.length) {
    //   return 400;
    // }
  
    // const listing = listings[listingId - 1];
  
    // for (const bid of listing['bids']) {
    //   if (parseFloat(bid_data['bidAmount']) < parseFloat(bid['bidAmount'].replace(",", ""))) {
    //     return 409;
    //   }
    // }

    const listingId = parseInt(bid_data['auctionId'], 10);
    const highest_bid = await data.getHighestBid(listingId);
    if (parseFloat(bid_data['bidAmount']) < highest_bid) {
      return 409;
    }
  
    const newBid = {
      listing_id: listingId,
      bidder: bid_data['bidderName'],
      amount: parseFloat(bid_data['bidAmount']),
      comment: bid_data['bidComment']
    };
  
    // listing['bids'].push(newBid);
    const result = await data.placeBid(newBid);
  
    return 201;
}
  
app.post('/api/place_bid',async (req, res) => {
    const bid_data = req.body;

    if (!bid_data || req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({
            error: 'Invalid request. Expected Content-Type: application/json'
        });
    }

    const status = await addNewBid(bid_data);

    res.cookie('bidderName', bid_data['bidderName']);

    // const auction = listings[parseInt(bid_data['auctionId'], 10) - 1];
    // res.status(status).json(auction.bids);

    const bids = await data.getBids(parseInt(bid_data['auctionId'], 10));
    res.status(status).json(bids);
});

app.delete('/api/delete_listing', (req, res) => {

    if (!req.body || req.headers['content-type'] !== 'application/json') {
        return res.status(400).json({
            data: null,
            status: 400,
            error: 'Invalid request. Expected Content-Type: application/json.'
        });
    }

    const listing_data = req.body;

    const status = removeListing(listing_data);

    if (status === 400) {
        return res.status(400).json({
            data: null,
            status: 400,
            error: 'Bad Request. Missing or invalid fields.'
        });
    } else if (status === 404) {
        return res.status(404).json({
            data: null,
            status: 404,
            error: 'Not Found. Listing does not exist.'
        });
    } else if (status === 204) {
        return res.status(204).json({
            data: null,
            status: 204,
            message: 'Listing deleted successfully.'
        });
    }
});

function removeListing(listing_data) {

    if (typeof listing_data !== 'object' || listing_data === null) {
        return 400;
    }

    if (!listing_data.hasOwnProperty('listing_id') || !listing_data['listing_id']) {
        return 400;
    }

    // for (let i = 0; i < listings.length; i++) {
    //     if (String(listings[i].ID) === String(listing_data['listing_id'])) {
    //         listings.splice(i, 1);
    //         return 204;
    //     }
    // }

    const result = data.deleteListing(listing_data['listing_id']);

    if (result) {
      return 204;
    }else{
      return 404;
    }
}

app.use((req, res) => {
    res.status(404).render('404.pug');
});

app.listen(port , () => {
    console.log(`bidding app listening on port ${port}`);
});