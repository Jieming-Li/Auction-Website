const banner = document.getElementById("banner");

function toggleBannerVisibility() {
    if (banner.style.visibility === "hidden") {
        banner.style.visibility = "visible";
    } else {
        banner.style.visibility = "hidden";
    }
}

setInterval(toggleBannerVisibility, 1000);
toggleBannerVisibility()