function showOtherCategory() {
    const categorySelect = document.getElementById("category");
    const otherCategoryDiv = document.getElementById("otherCategory");

    // Show or hide the "Other Category" input based on selection
    if (categorySelect.value === "other") {
        otherCategoryDiv.style.display = "block";
    } else {
        otherCategoryDiv.style.display = "none";
    }
}