function updateCountdowns() {
    const rows = document.querySelectorAll("#auctionTableBody tr");

    rows.forEach(row => {
        const countdownCell = row.querySelector(".timeRemaining");
        // const endTimeStr = countdownCell.getAttribute("data-end-date") + "T00:00:00Z";
        const endTimeStr = countdownCell.getAttribute("data-end-date");
        console.log(endTimeStr)
        const endTime = new Date(endTimeStr);
        const now = new Date();

        const timeDiff = endTime.getTime() - now.getTime();

        if (timeDiff < 0) {
            countdownCell.textContent = "Auction ended";
            return;
        }

        const secondsRemaining = Math.floor(timeDiff / 1000);
        const days = Math.floor(secondsRemaining / (3600 * 24));
        const hours = Math.floor((secondsRemaining % (3600 * 24)) / 3600);
        const minutes = Math.floor((secondsRemaining % 3600) / 60);
        const seconds = secondsRemaining % 60;

        countdownCell.textContent = `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
    });
}

setInterval(updateCountdowns, 1000);
updateCountdowns();

document.addEventListener("DOMContentLoaded", function () {
    const rows = document.querySelectorAll("#auctionTableBody tr");
    const previewContainer = document.getElementById('previewContainer');

    rows.forEach(row => {
        row.addEventListener("mouseenter", function () {
            const image = row.getAttribute("data-image");
            const description = row.getAttribute("data-description");

            previewContainer.innerHTML = `
                <img src="${image}" alt="Auction Image" class="preview-image">
                <p class="preview-description">${description}</p>
            `;
        });

        row.addEventListener("mouseleave", function () {
            previewContainer.innerHTML = "";
        });
    });
});

document.querySelectorAll(".deleteButton").forEach(button => {
    button.addEventListener('click', function() {
        const listingId = this.closest('tr').getAttribute('data-listing-id');
        const formData = {
            listing_id: listingId
        };
        const row = this.closest('tr');

        fetch('/api/delete_listing', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        
        .then(response => {
            let status = response.status;
            if (status === 204) {
                row.remove();
            }else if (status === 400 || status === 404) {
                alert("fail");
            }
        })
    });
});