const users = {
    "101": {
        name: "Aarav Johnson",
        vehicle: "DL01AB1234",
        phone: "7827418419",
        emergencyContact: "7827418419",
        policy: "ZK123456",
        bloodGroup: "B+",
        medical: "Diabetes"
    },
    "102": {
        name: "Malik Carter",
        vehicle: "DL02XY5678",
        phone: "7827418419",
        emergencyContact: "7827418419",
        policy: "ZK789012",
        bloodGroup: "O-",
        medical: "No known conditions"
    },
    "103": {
        name: "Riya Sharma",
        vehicle: "DL05MN3456",
        phone: "7827418419",
        emergencyContact: "7827418419",
        policy: "ZK456321",
        bloodGroup: "A+",
        medical: "Asthma"
    }
};

let currentLocation = "";

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    const errorContainer = document.getElementById("error-container");
    const mainContainer = document.getElementById("main-container");
    
    if (!id || !users[id]) {
        errorContainer.classList.remove("hidden");
        return;
    }
    
    const user = users[id];
    
    // Display Information
    document.getElementById("vehicle-number").textContent = user.vehicle;
    document.getElementById("owner-name").textContent = user.name;
    document.getElementById("policy-number").textContent = user.policy;
    document.getElementById("emergency-contact-display").textContent = user.emergencyContact;
    document.getElementById("blood-group").textContent = user.bloodGroup;
    document.getElementById("medical-info").textContent = user.medical;
    
    // Setup Action Buttons
    document.getElementById("btn-call-owner").href = `tel:${user.phone}`;
    document.getElementById("btn-call-emergency").href = `tel:${user.emergencyContact}`;
    
    updateMessageLinks(user);
    
    mainContainer.classList.remove("hidden");
    
    // Setup Location
    const getLocationBtn = document.getElementById("get-location-btn");
    const locationDisplay = document.getElementById("location-display");
    const coordinatesDisplay = document.getElementById("coordinates");
    const copyLocationBtn = document.getElementById("copy-location-btn");
    
    getLocationBtn.addEventListener("click", () => {
        if ("geolocation" in navigator) {
            getLocationBtn.textContent = "Locating...";
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    currentLocation = `https://maps.google.com/?q=${lat},${lng}`;
                    
                    coordinatesDisplay.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    locationDisplay.classList.remove("hidden");
                    getLocationBtn.textContent = "Update Location";
                    
                    updateMessageLinks(user);
                },
                (error) => {
                    alert("Error getting location. Please check your permissions.");
                    getLocationBtn.textContent = "Get My Location";
                }
            );
        } else {
            alert("Geolocation is not supported by your browser");
        }
    });
    
    copyLocationBtn.addEventListener("click", () => {
        if (currentLocation) {
            navigator.clipboard.writeText(currentLocation).then(() => {
                const originalText = copyLocationBtn.textContent;
                copyLocationBtn.textContent = "Copied!";
                setTimeout(() => {
                    copyLocationBtn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error("Failed to copy", err);
                alert("Failed to copy location.");
            });
        }
    });
});

function updateMessageLinks(user) {
    let message = `Emergency Alert!\nVehicle: ${user.vehicle}\nBlood Group: ${user.bloodGroup}\nCondition: ${user.medical}\nPossible incident detected.\nPlease respond immediately.`;
    
    if (currentLocation) {
        message += `\n\nLocation: ${currentLocation}`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    
    // Set SMS link
    document.getElementById("btn-sms").href = `sms:${user.emergencyContact}?body=${encodedMessage}`;
    
    // Set WhatsApp link
    let waPhone = user.emergencyContact;
    if (!waPhone.startsWith("91")) {
        waPhone = "91" + waPhone;
    }
    document.getElementById("btn-whatsapp").href = `https://wa.me/${waPhone}?text=${encodedMessage}`;
}
