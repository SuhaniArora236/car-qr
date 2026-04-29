// User Database for Portal (simulated)
// username: user1, user2, user3
// passwords: 1234
// IDs correspond to the same users in scan.html
const portalUsers = {
    "user1": {
        id: "101",
        password: "1234",
        name: "Aarav Johnson",
        vehicle: "DL01AB1234",
        policy: "ZK123456",
        bloodGroup: "B+",
        medical: "Diabetes",
        image: "user1.jpg",
        doc: "user1.pdf"
    },
    "user2": {
        id: "102",
        password: "1234",
        name: "Malik Carter",
        vehicle: "DL02XY5678",
        policy: "ZK789012",
        bloodGroup: "O-",
        medical: "No known conditions",
        image: "user2.jpg",
        doc: "user2.pdf"
    },
    "user3": {
        id: "103",
        password: "1234",
        name: "Riya Sharma",
        vehicle: "DL05MN3456",
        policy: "ZK456321",
        bloodGroup: "A+",
        medical: "Asthma",
        image: "user3.jpg",
        doc: "user3.pdf"
    }
};

let currentUser = null;
let html5QrcodeScanner = null;

document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const loginSection = document.getElementById("login-section");
    const dashboardSection = document.getElementById("dashboard-section");
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const logoutBtn = document.getElementById("logout-btn");

    // Login Handle
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const userVal = document.getElementById("username").value.trim().toLowerCase();
        const passVal = document.getElementById("password").value;

        if (portalUsers[userVal] && portalUsers[userVal].password === passVal) {
            currentUser = portalUsers[userVal];
            loginError.classList.add("hidden");
            showDashboard();
        } else {
            loginError.classList.remove("hidden");
        }
    });

    // Logout Handle
    logoutBtn.addEventListener("click", () => {
        currentUser = null;
        dashboardSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
        document.getElementById("login-form").reset();
        document.getElementById("qrcode-container").innerHTML = ""; // Clear QR
    });

    function showDashboard() {
        loginSection.classList.add("hidden");
        dashboardSection.classList.remove("hidden");

        // Populate info
        document.getElementById("welcome-message").textContent = `Welcome, ${currentUser.name}`;
        document.getElementById("dash-vehicle").textContent = currentUser.vehicle;
        document.getElementById("dash-policy").textContent = currentUser.policy;
        document.getElementById("dash-blood").textContent = currentUser.bloodGroup;
        document.getElementById("dash-medical").textContent = currentUser.medical;
        
        // Populate docs
        document.getElementById("user-image").src = currentUser.image;
        document.getElementById("user-policy-link").href = currentUser.doc;

        // Generate QR
        generateQRCode();
    }

    function generateQRCode() {
        const qrContainer = document.getElementById("qrcode-container");
        qrContainer.innerHTML = ""; // Clear previous
        
        // Create URL for scanning (points to scan.html?id=xxx)
        let currentPath = window.location.pathname;
        if (currentPath.endsWith('.html')) {
            currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
        }
        if (currentPath.endsWith('/')) {
            currentPath = currentPath.substring(0, currentPath.length - 1);
        }
        const scanUrl = `${window.location.origin}${currentPath}/scan.html?id=${currentUser.id}`;

        new QRCode(qrContainer, {
            text: scanUrl,
            width: 250,
            height: 250,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }

    // QR Download Handle
    document.getElementById("download-qr-btn").addEventListener("click", () => {
        const qrImage = document.querySelector("#qrcode-container img");
        if (qrImage && qrImage.src) {
            const link = document.createElement('a');
            link.download = `CarBuddyQR_${currentUser.vehicle}.png`;
            link.href = qrImage.src;
            link.click();
        } else {
            // Fallback for canvas if image isn't generated yet
            const qrCanvas = document.querySelector("#qrcode-container canvas");
            if (qrCanvas) {
                const image = qrCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                const link = document.createElement('a');
                link.download = `CarBuddyQR_${currentUser.vehicle}.png`;
                link.href = image;
                link.click();
            } else {
                alert("QR Code is not ready yet.");
            }
        }
    });

    // --- QR Scanner Functionality ---
    const startScanBtn = document.getElementById("start-scan-btn");
    const dashScanBtn = document.getElementById("dash-scan-btn");
    
    function onScanSuccess(decodedText, decodedResult) {
        // Stop scanning
        if(html5QrcodeScanner) {
            html5QrcodeScanner.clear().then(() => {
                // If it's a valid URL, redirect
                if(decodedText.includes('scan.html?id=')) {
                    window.location.href = decodedText;
                } else {
                    alert("Scanned QR Code is not a valid CarBuddy QR: " + decodedText);
                }
            }).catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        }
    }

    function startScanner(readerElementId) {
        document.getElementById(readerElementId).classList.remove("hidden");
        html5QrcodeScanner = new Html5QrcodeScanner(
            readerElementId, 
            { fps: 10, qrbox: {width: 250, height: 250} },
            /* verbose= */ false
        );
        html5QrcodeScanner.render(onScanSuccess, (error) => {
            // Ignore scan errors
        });
    }

    if (startScanBtn) {
        startScanBtn.addEventListener("click", () => {
            startScanBtn.classList.add("hidden");
            startScanner("reader");
        });
    }

    if (dashScanBtn) {
        dashScanBtn.addEventListener("click", () => {
            dashScanBtn.classList.add("hidden");
            startScanner("dash-reader");
        });
    }
});
