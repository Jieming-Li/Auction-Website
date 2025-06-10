function showBidForm() {
    const biddingForm = document.getElementById("biddingForm");
    const bidButton = document.getElementById("bidButton");

    if (biddingForm.style.display === "none") {
        biddingForm.style.display = "block";
        bidButton.textContent = "Cancel Bid";
    } else {
        biddingForm.style.display = "none";
        bidButton.textContent = "Place Bid";
    }
}

function renderBiddingList(newBids) {
    const bidsContainer = document.querySelector('.bids');
    bidsContainer.innerHTML = ''; 

    newBids.forEach(bid => {
        const bidHTML = `
            <div class="bid">
                <span class="bidder">${bid["name"]}</span>
                <span class="amount">$${bid["bid amount"]}</span>
                <p>${bid["comment"]}</p>
            </div>
        `;
        bidsContainer.innerHTML += bidHTML;
    });
}

function submitBid() {
    const formData = {
        auctionId: document.getElementById('auctionId').value,
        bidderName: document.getElementById('bidderName').value,
        bidAmount: parseFloat(document.getElementById('bidAmount').value),
        bidComment: document.getElementById('bidComment').value
    };

    console.log("Form data to be sent:", formData);

    fetch('/api/place_bid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': 'name='+document.getElementById('bidderName').value
        },
        credentials: "include",
        body: JSON.stringify(formData)
    })
    
    .then(response => {
        let status = response.status;
        if (status === 201) {
            return response.json().then(data => ({data, status}));
        }else if (status === 400 || status === 409) {
            return response.json().then(data => ({data, status}));
        }
    })
    .then(({data, status}) => {
        if (status === 201) {
            console.log("Success:", data);
            renderBiddingList(JSON.parse(JSON.stringify(data))); 
            alert("Bid placed successfully!");
            location.reload();
        }else if(status === 400 || status === 500){
            alert("there has been a server error");
        }else if(status === 409){
            const bidAmountField = document.getElementById('bidAmount');
            bidAmountField.style.border = '2px solid red';
            alert("Your bid is too low!");
        }
    })
}