const form = document.querySelector("form");

// 10 digit NIN
function generateNIN() {
    return Math.floor(1000000000 + Math.random() * 9000000000);
}

form.addEventListener("submit", function (e) {
    e.preventDefault(); // stop page reload

    // form values
    const firstName = document.querySelector('input[name="first_name"]').value;
    const middleName = document.querySelector('input[name="middle_name"]').value;
    const lastName = document.querySelector('input[name="last_name"]').value;
    const dob = document.querySelector('input[name="dob"]').value;
    const gender = document.querySelector('select[name="gender"]').value;
    const phone = document.querySelector('input[name="phone"]').value;
    const address = document.querySelector('textarea[name="address"]').value;

    const photoInput = document.querySelector('input[name="passport_photo"]');
    const photoFile = photoInput.files[0];

    const ninNumber = generateNIN();

    // Display values
    document.getElementById("displayNin").textContent = ninNumber;
    document.getElementById("displayName").textContent =
        firstName + " " + middleName + " " + lastName;
    document.getElementById("displayDob").textContent = dob;
    document.getElementById("displayGender").textContent = gender;
    document.getElementById("displayPhone").textContent = phone;
    document.getElementById("displayAddress").textContent = address;

    // Display image
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
            document.getElementById("slipPhoto").src = event.target.result;
        };
        reader.readAsDataURL(photoFile);
    }

    // Show the slip
    document.getElementById("ninSlip").style.display = "block";
});