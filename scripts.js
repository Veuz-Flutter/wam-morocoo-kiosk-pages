
// Function to receive data from Flutter
function receiveFromFlutter(data) {
    console.log('📥 Received from Flutter:', data);

    if (data.type === 'toggleKioskLock') {
        toggleKioskLock(data.value);
    } else if (data.type === 'togglePoweredBy') {
        togglePoweredBy(data.value);
    } else if (data.type === 'toggleCustomerDetails') {
        // Pass the customer data object (if available) or null
        toggleCustomerDetails(data.customerData !== undefined ? data.customerData : data.value);
    } else if (data.type === 'toggleRegistrationMode') {
        toggleRegistrationMode(data.value);
    } else if (data.type === 'showError') {
        showError(data.error);
    }
}

// Function to send data to Flutter
function sendToFlutter(data) {
    try {
        if (window.flutter_inappwebview) {
            window.flutter_inappwebview.callHandler('FlutterChannel', JSON.stringify(data));
            console.log('📤 Sent to Flutter:', data);
        }
    } catch (error) {
        console.error('❌ Error sending to Flutter:', error);
    }
}

// Check-in functions
function checkInWithQR() {
    console.log('🔍 QR Code check-in initiated');

    // show modal
    const modal = document.getElementById('qrModal');
    if (modal) {
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');

        // clear previous timeout if any
        if (window.__qrModalTimeout) {
            clearTimeout(window.__qrModalTimeout);
        }

        // auto-close after 5 seconds
        window.__qrModalTimeout = setTimeout(() => {
            modal.classList.remove('visible');
            modal.setAttribute('aria-hidden', 'true');
        }, 3000);
    }

    sendToFlutter({
        type: 'checkInQR',
        timestamp: new Date().toISOString()
    });
}

function checkInWithSearch() {
    console.log('🔍 Search check-in initiated');
    sendToFlutter({
        type: 'checkInSearch',
        timestamp: new Date().toISOString()
    });
}


function openDrawer() {
    console.log('✅ open drawer');
    sendToFlutter({
        type: 'openDrawer',
        timestamp: new Date().toISOString()
    });
}

// // Self registration action
// function selfRegister(extraData) {
//     const payload = {
//         type: 'selfRegister',
//         timestamp: new Date().toISOString()
//     };
//     if (extraData && typeof extraData === 'object') {
//         payload.data = extraData;
//     }
//     console.log('📝 Self registration triggered');
//     sendToFlutter(payload);
// }

// Registration mode state
let isRegistrationMode = false;

function toggleRegistrationMode(value) {

    closeRegistrationForm();
    // If value is provided (true/false), use it; otherwise toggle
    isRegistrationMode = value !== undefined ? value : !isRegistrationMode;

    const lockIcon = document.getElementById('lockIcon');
    const drawerBtn = document.querySelector('.drawer-btn');
    const selfRegistrationButton = document.querySelector('.checkin-buttons .checkin-btn[onclick="openRegistrationForm()"]');
    const qrCodeButton = document.querySelector('.checkin-buttons .checkin-btn[onclick="checkInWithQR()"]');
    const searchButton = document.querySelector('.checkin-buttons .checkin-btn[onclick="checkInWithSearch()"]');

    if (isRegistrationMode) {
        // Registration mode: show unlock button, hide drawer button, hide first 2 buttons, show Self Registration button
        if (lockIcon) {
            lockIcon.style.visibility = 'visible';
        }
        if (drawerBtn) {
            drawerBtn.classList.add('hidden');
        }
        if (qrCodeButton) {
            qrCodeButton.classList.add('hidden');
        }
        if (searchButton) {
            searchButton.classList.add('hidden');
        }
        if (selfRegistrationButton) {
            selfRegistrationButton.classList.remove('hidden');
        }
    } else {
        // Normal mode: hide unlock button (unless kiosk is locked), show drawer button, show first 2 buttons, hide Self Registration button
        if (lockIcon) {
            // Only show the unlock if kiosk is locked; otherwise hide it
            lockIcon.style.visibility = isKioskLocked ? 'visible' : 'hidden';
        }
        if (drawerBtn) {
            drawerBtn.classList.remove('hidden');
        }
        if (qrCodeButton) {
            qrCodeButton.classList.remove('hidden');
        }
        if (searchButton) {
            searchButton.classList.remove('hidden');
        }
        if (selfRegistrationButton) {
            selfRegistrationButton.classList.add('hidden');
        }
    }

    sendToFlutter({
        type: 'toggleRegistrationMode',
        value: isRegistrationMode,
        timestamp: new Date().toISOString(),
    });
}

// Kiosk lock state
let isKioskLocked = false;

function toggleKioskLock(value) {
    // If value is provided (true/false), use it; otherwise toggle
    isKioskLocked = value !== undefined ? value : !isKioskLocked;

    const mainContent = document.getElementById('mainContent');
    const drawerBtn = document.querySelector('.drawer-btn');
    const footer = document.querySelector('.footer');
    const lockIcon = document.getElementById('lockIcon');

    if (isKioskLocked) {
        // Lock the kiosk
        mainContent.classList.add('hidden');
        drawerBtn.classList.add('hidden');
        // lockIcon.textContent = '🔓'; // Show unlock icon
        lockIcon.style.visibility = 'visible';
        console.log('🔒 Kiosk locked');
    } else {
        // Unlock the kiosk
        mainContent.classList.remove('hidden');
        drawerBtn.classList.remove('hidden');
        // lockIcon.textContent = '🔒'; // Show lock icon
        // change the lock icon visiblity hidden
        lockIcon.style.visibility = 'hidden';
        console.log('🔓 Kiosk unlocked');
    }
    sendToFlutter({
        type: 'toggleKioskLock',
        value: isKioskLocked,
        timestamp: new Date().toISOString(),
    });
}

// Powered-by visibility state
let isPoweredByVisible = true;

function togglePoweredBy(value) {
    // If value is provided (true/false), use it; otherwise toggle
    isPoweredByVisible = value !== undefined ? value : !isPoweredByVisible;

    const footer = document.querySelector('.footer');

    if (isPoweredByVisible) {
        // Show powered-by logo
        footer.classList.remove('hidden');
        console.log('👁️ Powered-by logo visible');
    } else {
        // Hide powered-by logo
        footer.classList.add('hidden');
        console.log('🙈 Powered-by logo hidden');
    }
    sendToFlutter({
        type: 'togglePoweredBy',
        value: isPoweredByVisible,
        timestamp: new Date().toISOString(),
    });
}

function unlockKioskLock() {
    console.log('✅ unlock kiosk');
    sendToFlutter({
        type: 'unlockKioskLock',
        timestamp: new Date().toISOString()
    });
}

function hideDummyControlls() {
    const dummyControls = document.getElementById('dummyControls');
    if (dummyControls) {
        dummyControls.classList.add('hidden');
        console.log('🙈 Dummy controls hidden');
    }
}

function showWelcome(userData) {
    console.log('👋 Welcome message shown', userData);

    // Close the registration form
    closeRegistrationForm();

    // Update welcome message with user data
    if (userData) {
        // Extract the name from userData
        const firstName = userData.firstname || '';
        const lastName = userData.lastname || '';
        const fullName = firstName ? `${firstName} ${lastName}`.trim() : 'Visitor';

        // Update the welcome message content
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) {
            welcomeName.textContent = fullName;
        }
    } else {
        // Default message if no data provided
        const welcomeName = document.getElementById('welcome-name');
        if (welcomeName) {
            welcomeName.textContent = '';
        }
    }

    // Show the welcome message
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.classList.remove('hidden');

        // Hide the message after 5 seconds
        setTimeout(() => {
            welcomeMessage.classList.add('hidden');
            console.log('🙈 Welcome message hidden');
        }, 5000);
    }

    sendToFlutter({
        type: 'showWelcome',
        data: userData,
        timestamp: new Date().toISOString()
    });
}

function showDummyControlls() {
    const dummyControls = document.getElementById('dummyControls');
    if (dummyControls) {
        dummyControls.classList.remove('hidden');
        console.log('👁️ Dummy controls visible');
    }
}

// Registration Form Functions
let registrationFormAutoCloseTimeout = null;
let iti = null; // intl-tel-input instance

// Single country list variable for all dropdowns - Complete list of all countries
const COUNTRIES_LIST = [
    { value: "Afghanistan", text: "Afghanistan", code: "af" },
    { value: "Albania", text: "Albania", code: "al" },
    { value: "Algeria", text: "Algeria", code: "dz" },
    { value: "Andorra", text: "Andorra", code: "ad" },
    { value: "Angola", text: "Angola", code: "ao" },
    { value: "Antigua and Barbuda", text: "Antigua and Barbuda", code: "ag" },
    { value: "Argentina", text: "Argentina", code: "ar" },
    { value: "Armenia", text: "Armenia", code: "am" },
    { value: "Australia", text: "Australia", code: "au" },
    { value: "Austria", text: "Austria", code: "at" },
    { value: "Azerbaijan", text: "Azerbaijan", code: "az" },
    { value: "Bahamas", text: "Bahamas", code: "bs" },
    { value: "Bahrain", text: "Bahrain", code: "bh" },
    { value: "Bangladesh", text: "Bangladesh", code: "bd" },
    { value: "Barbados", text: "Barbados", code: "bb" },
    { value: "Belarus", text: "Belarus", code: "by" },
    { value: "Belgium", text: "Belgium", code: "be" },
    { value: "Belize", text: "Belize", code: "bz" },
    { value: "Benin", text: "Benin", code: "bj" },
    { value: "Bhutan", text: "Bhutan", code: "bt" },
    { value: "Bolivia", text: "Bolivia", code: "bo" },
    { value: "Bosnia and Herzegovina", text: "Bosnia and Herzegovina", code: "ba" },
    { value: "Botswana", text: "Botswana", code: "bw" },
    { value: "Brazil", text: "Brazil", code: "br" },
    { value: "Brunei", text: "Brunei", code: "bn" },
    { value: "Bulgaria", text: "Bulgaria", code: "bg" },
    { value: "Burkina Faso", text: "Burkina Faso", code: "bf" },
    { value: "Burundi", text: "Burundi", code: "bi" },
    { value: "Cambodia", text: "Cambodia", code: "kh" },
    { value: "Cameroon", text: "Cameroon", code: "cm" },
    { value: "Canada", text: "Canada", code: "ca" },
    { value: "Cape Verde", text: "Cape Verde", code: "cv" },
    { value: "Central African Republic", text: "Central African Republic", code: "cf" },
    { value: "Chad", text: "Chad", code: "td" },
    { value: "Chile", text: "Chile", code: "cl" },
    { value: "China", text: "China", code: "cn" },
    { value: "Colombia", text: "Colombia", code: "co" },
    { value: "Comoros", text: "Comoros", code: "km" },
    { value: "Congo", text: "Congo", code: "cg" },
    { value: "Costa Rica", text: "Costa Rica", code: "cr" },
    { value: "Croatia", text: "Croatia", code: "hr" },
    { value: "Cuba", text: "Cuba", code: "cu" },
    { value: "Cyprus", text: "Cyprus", code: "cy" },
    { value: "Czech Republic", text: "Czech Republic", code: "cz" },
    { value: "Denmark", text: "Denmark", code: "dk" },
    { value: "Djibouti", text: "Djibouti", code: "dj" },
    { value: "Dominica", text: "Dominica", code: "dm" },
    { value: "Dominican Republic", text: "Dominican Republic", code: "do" },
    { value: "East Timor", text: "East Timor", code: "tl" },
    { value: "Ecuador", text: "Ecuador", code: "ec" },
    { value: "Egypt", text: "Egypt", code: "eg" },
    { value: "El Salvador", text: "El Salvador", code: "sv" },
    { value: "Equatorial Guinea", text: "Equatorial Guinea", code: "gq" },
    { value: "Eritrea", text: "Eritrea", code: "er" },
    { value: "Estonia", text: "Estonia", code: "ee" },
    { value: "Ethiopia", text: "Ethiopia", code: "et" },
    { value: "Fiji", text: "Fiji", code: "fj" },
    { value: "Finland", text: "Finland", code: "fi" },
    { value: "France", text: "France", code: "fr" },
    { value: "Gabon", text: "Gabon", code: "ga" },
    { value: "Gambia", text: "Gambia", code: "gm" },
    { value: "Georgia", text: "Georgia", code: "ge" },
    { value: "Germany", text: "Germany", code: "de" },
    { value: "Ghana", text: "Ghana", code: "gh" },
    { value: "Greece", text: "Greece", code: "gr" },
    { value: "Grenada", text: "Grenada", code: "gd" },
    { value: "Guatemala", text: "Guatemala", code: "gt" },
    { value: "Guinea", text: "Guinea", code: "gn" },
    { value: "Guinea-Bissau", text: "Guinea-Bissau", code: "gw" },
    { value: "Guyana", text: "Guyana", code: "gy" },
    { value: "Haiti", text: "Haiti", code: "ht" },
    { value: "Honduras", text: "Honduras", code: "hn" },
    { value: "Hungary", text: "Hungary", code: "hu" },
    { value: "Iceland", text: "Iceland", code: "is" },
    { value: "India", text: "India", code: "in" },
    { value: "Indonesia", text: "Indonesia", code: "id" },
    { value: "Iran", text: "Iran", code: "ir" },
    { value: "Iraq", text: "Iraq", code: "iq" },
    { value: "Ireland", text: "Ireland", code: "ie" },
    { value: "Israel", text: "Israel", code: "il" },
    { value: "Italy", text: "Italy", code: "it" },
    { value: "Ivory Coast", text: "Ivory Coast", code: "ci" },
    { value: "Jamaica", text: "Jamaica", code: "jm" },
    { value: "Japan", text: "Japan", code: "jp" },
    { value: "Jordan", text: "Jordan", code: "jo" },
    { value: "Kazakhstan", text: "Kazakhstan", code: "kz" },
    { value: "Kenya", text: "Kenya", code: "ke" },
    { value: "Kiribati", text: "Kiribati", code: "ki" },
    { value: "North Korea", text: "North Korea", code: "kp" },
    { value: "South Korea", text: "South Korea", code: "kr" },
    { value: "Kuwait", text: "Kuwait", code: "kw" },
    { value: "Kyrgyzstan", text: "Kyrgyzstan", code: "kg" },
    { value: "Laos", text: "Laos", code: "la" },
    { value: "Latvia", text: "Latvia", code: "lv" },
    { value: "Lebanon", text: "Lebanon", code: "lb" },
    { value: "Lesotho", text: "Lesotho", code: "ls" },
    { value: "Liberia", text: "Liberia", code: "lr" },
    { value: "Libya", text: "Libya", code: "ly" },
    { value: "Liechtenstein", text: "Liechtenstein", code: "li" },
    { value: "Lithuania", text: "Lithuania", code: "lt" },
    { value: "Luxembourg", text: "Luxembourg", code: "lu" },
    { value: "Macedonia", text: "Macedonia", code: "mk" },
    { value: "Madagascar", text: "Madagascar", code: "mg" },
    { value: "Malawi", text: "Malawi", code: "mw" },
    { value: "Malaysia", text: "Malaysia", code: "my" },
    { value: "Maldives", text: "Maldives", code: "mv" },
    { value: "Mali", text: "Mali", code: "ml" },
    { value: "Malta", text: "Malta", code: "mt" },
    { value: "Marshall Islands", text: "Marshall Islands", code: "mh" },
    { value: "Mauritania", text: "Mauritania", code: "mr" },
    { value: "Mauritius", text: "Mauritius", code: "mu" },
    { value: "Mexico", text: "Mexico", code: "mx" },
    { value: "Micronesia", text: "Micronesia", code: "fm" },
    { value: "Moldova", text: "Moldova", code: "md" },
    { value: "Monaco", text: "Monaco", code: "mc" },
    { value: "Mongolia", text: "Mongolia", code: "mn" },
    { value: "Montenegro", text: "Montenegro", code: "me" },
    { value: "Morocco", text: "Morocco", code: "ma" },
    { value: "Mozambique", text: "Mozambique", code: "mz" },
    { value: "Myanmar", text: "Myanmar", code: "mm" },
    { value: "Namibia", text: "Namibia", code: "na" },
    { value: "Nauru", text: "Nauru", code: "nr" },
    { value: "Nepal", text: "Nepal", code: "np" },
    { value: "Netherlands", text: "Netherlands", code: "nl" },
    { value: "New Zealand", text: "New Zealand", code: "nz" },
    { value: "Nicaragua", text: "Nicaragua", code: "ni" },
    { value: "Niger", text: "Niger", code: "ne" },
    { value: "Nigeria", text: "Nigeria", code: "ng" },
    { value: "Norway", text: "Norway", code: "no" },
    { value: "Oman", text: "Oman", code: "om" },
    { value: "Pakistan", text: "Pakistan", code: "pk" },
    { value: "Palau", text: "Palau", code: "pw" },
    { value: "Palestine", text: "Palestine", code: "ps" },
    { value: "Panama", text: "Panama", code: "pa" },
    { value: "Papua New Guinea", text: "Papua New Guinea", code: "pg" },
    { value: "Paraguay", text: "Paraguay", code: "py" },
    { value: "Peru", text: "Peru", code: "pe" },
    { value: "Philippines", text: "Philippines", code: "ph" },
    { value: "Poland", text: "Poland", code: "pl" },
    { value: "Portugal", text: "Portugal", code: "pt" },
    { value: "Qatar", text: "Qatar", code: "qa" },
    { value: "Romania", text: "Romania", code: "ro" },
    { value: "Russia", text: "Russia", code: "ru" },
    { value: "Rwanda", text: "Rwanda", code: "rw" },
    { value: "Saint Kitts and Nevis", text: "Saint Kitts and Nevis", code: "kn" },
    { value: "Saint Lucia", text: "Saint Lucia", code: "lc" },
    { value: "Saint Vincent and the Grenadines", text: "Saint Vincent and the Grenadines", code: "vc" },
    { value: "Samoa", text: "Samoa", code: "ws" },
    { value: "San Marino", text: "San Marino", code: "sm" },
    { value: "Sao Tome and Principe", text: "Sao Tome and Principe", code: "st" },
    { value: "Saudi Arabia", text: "Saudi Arabia", code: "sa" },
    { value: "Senegal", text: "Senegal", code: "sn" },
    { value: "Serbia", text: "Serbia", code: "rs" },
    { value: "Seychelles", text: "Seychelles", code: "sc" },
    { value: "Sierra Leone", text: "Sierra Leone", code: "sl" },
    { value: "Singapore", text: "Singapore", code: "sg" },
    { value: "Slovakia", text: "Slovakia", code: "sk" },
    { value: "Slovenia", text: "Slovenia", code: "si" },
    { value: "Solomon Islands", text: "Solomon Islands", code: "sb" },
    { value: "Somalia", text: "Somalia", code: "so" },
    { value: "South Africa", text: "South Africa", code: "za" },
    { value: "South Sudan", text: "South Sudan", code: "ss" },
    { value: "Spain", text: "Spain", code: "es" },
    { value: "Sri Lanka", text: "Sri Lanka", code: "lk" },
    { value: "Sudan", text: "Sudan", code: "sd" },
    { value: "Suriname", text: "Suriname", code: "sr" },
    { value: "Swaziland", text: "Swaziland", code: "sz" },
    { value: "Sweden", text: "Sweden", code: "se" },
    { value: "Switzerland", text: "Switzerland", code: "ch" },
    { value: "Syria", text: "Syria", code: "sy" },
    { value: "Taiwan", text: "Taiwan", code: "tw" },
    { value: "Tajikistan", text: "Tajikistan", code: "tj" },
    { value: "Tanzania", text: "Tanzania", code: "tz" },
    { value: "Thailand", text: "Thailand", code: "th" },
    { value: "Togo", text: "Togo", code: "tg" },
    { value: "Tonga", text: "Tonga", code: "to" },
    { value: "Trinidad and Tobago", text: "Trinidad and Tobago", code: "tt" },
    { value: "Tunisia", text: "Tunisia", code: "tn" },
    { value: "Turkey", text: "Turkey", code: "tr" },
    { value: "Turkmenistan", text: "Turkmenistan", code: "tm" },
    { value: "Tuvalu", text: "Tuvalu", code: "tv" },
    { value: "UAE", text: "United Arab Emirates", code: "ae" },
    { value: "Uganda", text: "Uganda", code: "ug" },
    { value: "Ukraine", text: "Ukraine", code: "ua" },
    { value: "UK", text: "United Kingdom", code: "gb" },
    { value: "USA", text: "United States", code: "us" },
    { value: "Uruguay", text: "Uruguay", code: "uy" },
    { value: "Uzbekistan", text: "Uzbekistan", code: "uz" },
    { value: "Vanuatu", text: "Vanuatu", code: "vu" },
    { value: "Vatican City", text: "Vatican City", code: "va" },
    { value: "Venezuela", text: "Venezuela", code: "ve" },
    { value: "Vietnam", text: "Vietnam", code: "vn" },
    { value: "Yemen", text: "Yemen", code: "ye" },
    { value: "Zambia", text: "Zambia", code: "zm" },
    { value: "Zimbabwe", text: "Zimbabwe", code: "zw" }
];

// Preferred countries for phone input
const PREFERRED_COUNTRIES = ["in", "ae", "us", "gb"];

// Initialize intl-tel-input when form opens
function initPhoneInput() {
    const input = document.querySelector("#reg-mobile");
    if (input && window.intlTelInput) {
        // Destroy existing instance if any
        if (iti) {
            try {
                iti.destroy();
            } catch (e) {
                console.warn('Error destroying iti instance:', e);
            }
            iti = null;
        }

        if (!iti) {
            iti = window.intlTelInput(input, {
                initialCountry: "ae",
                preferredCountries: PREFERRED_COUNTRIES,
                separateDialCode: true,
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@25.10.12/build/js/utils.js"
            });
        }
    }
}

// Initialize Select2 for nationality and country dropdowns
function initSelect2() {
    if (typeof $ === 'undefined' || !$.fn.select2) {
        console.warn('jQuery or Select2 not loaded');
        return;
    }

    // Populate nationality dropdown
    const nationalitySelect = $('#reg-nationality');
    if (nationalitySelect.length) {
        // Destroy existing Select2 instance if any
        if (nationalitySelect.data('select2')) {
            nationalitySelect.select2('destroy');
        }

        nationalitySelect.empty().append(new Option('Select Nationality', ''));
        COUNTRIES_LIST.forEach(country => {
            nationalitySelect.append(new Option(country.text, country.value));
        });

        nationalitySelect.select2({
            placeholder: 'Select Nationality',
            allowClear: true,
            width: '100%',
            dropdownParent: $('#registrationForm')
        });

        // Autofocus search box when dropdown opens for nationality
        nationalitySelect.on('select2:open', function () {
            setTimeout(function () {
                const f = document.querySelector('.select2-search__field');
                if (f) f.focus();
            }, 100);
        });
    }

    // Populate country of residence dropdown
    const countrySelect = $('#reg-country-of-residence');
    if (countrySelect.length) {
        // Destroy existing Select2 instance if any
        if (countrySelect.data('select2')) {
            countrySelect.select2('destroy');
        }

        countrySelect.empty().append(new Option('Select Country of Residence', ''));
        COUNTRIES_LIST.forEach(country => {
            countrySelect.append(new Option(country.text, country.value));
        });

        countrySelect.select2({
            placeholder: 'Select Country of Residence',
            allowClear: true,
            width: '100%',
            dropdownParent: $('#registrationForm')
        });

        // Autofocus search box when dropdown opens for country of residence
        countrySelect.on('select2:open', function () {
            setTimeout(function () {
                const f = document.querySelector('.select2-search__field');
                if (f) f.focus();
            }, 100);
        });

        // Update badge preview on Select2 change
        countrySelect.on('change', function () {
            updateBadgePreview();
        });
    }
}

// Function to update badge preview in real-time
function updateBadgePreview() {
    const firstName = document.getElementById('reg-firstname');
    const lastName = document.getElementById('reg-lastname');
    const jobTitle = document.getElementById('reg-designation');
    const company = document.getElementById('reg-company');
    const countrySelect = $('#reg-country-of-residence');

    if (!firstName || !lastName || !jobTitle || !company) return;

    // Update full name
    const fullName = [firstName.value.trim(), lastName.value.trim()].filter(name => name).join(' ') || 'FULL NAME';
    const badgeFullname = document.getElementById('badge-fullname');
    if (badgeFullname) {
        badgeFullname.textContent = fullName.toUpperCase();
    }

    // Update job title
    const badgeJobtitle = document.getElementById('badge-jobtitle');
    if (badgeJobtitle) {
        badgeJobtitle.textContent = jobTitle.value.trim().toUpperCase() || 'JOB TITLE';
    }

    // Update company name
    const badgeCompany = document.getElementById('badge-company');
    if (badgeCompany) {
        badgeCompany.textContent = company.value.trim().toUpperCase() || 'COMPANY NAME';
    }

    // Update country of residence
    const badgeCountry = document.getElementById('badge-country');
    if (badgeCountry) {
        const country = countrySelect.val() || 'COUNTRY OF RESIDENCE';
        badgeCountry.textContent = country.toUpperCase();
    }
}

// Initialize registration form after HTML is loaded
function initRegistrationFormAfterLoad() {
    console.log('🔧 Initializing registration form after load');
    setTimeout(() => {
        initPhoneInput();
        initSelect2();

        // Setup badge preview event listeners
        setupBadgePreviewListeners();
    }, 200);
}

// Setup badge preview event listeners
function setupBadgePreviewListeners() {
    // Use jQuery if available, otherwise use vanilla JS
    if (typeof $ !== 'undefined') {
        $(document).ready(function () {
            $('#reg-firstname').on('input', updateBadgePreview);
            $('#reg-lastname').on('input', updateBadgePreview);
            $('#reg-designation').on('input', updateBadgePreview);
            $('#reg-company').on('input', updateBadgePreview);
        });
    } else {
        // Fallback to vanilla JS
        const firstNameField = document.getElementById('reg-firstname');
        const lastNameField = document.getElementById('reg-lastname');
        const designationField = document.getElementById('reg-designation');
        const companyField = document.getElementById('reg-company');

        if (firstNameField) firstNameField.addEventListener('input', updateBadgePreview);
        if (lastNameField) lastNameField.addEventListener('input', updateBadgePreview);
        if (designationField) designationField.addEventListener('input', updateBadgePreview);
        if (companyField) companyField.addEventListener('input', updateBadgePreview);
    }
}

function openRegistrationForm() {
    console.log('📝 Opening registration form');
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.classList.remove('hidden');
        console.log('👁️ Registration form visible');
    }

    // Clear any previous errors when opening the form
    clearErrors();

    // Hide loading state when opening form
    hideRegistrationLoading();

    // Ensure autocomplete is disabled on form and fields
    disableRegistrationAutocomplete();

    // Initialize phone input and Select2 when form opens
    setTimeout(() => {
        initPhoneInput();
        initSelect2();
        setupFieldErrorClearing();
        setupBadgePreviewListeners();
    }, 100);

    // Focus on first name field after 1 second
    setTimeout(() => {
        const firstNameField = document.getElementById('reg-firstname');
        if (firstNameField) {
            firstNameField.focus();
        }
    }, 100);

    sendToFlutter({
        type: 'openRegistrationForm',
        timestamp: new Date().toISOString()
    });
}

function closeRegistrationForm() {
    console.log('❌ Closing registration form');
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.classList.add('hidden');
        console.log('🙈 Registration form hidden');
    }

    // Clear any existing validation errors and reset fields
    clearErrors();
    clearRegistrationFormFields();

    // Clear auto-close timeout if it exists
    if (registrationFormAutoCloseTimeout) {
        clearTimeout(registrationFormAutoCloseTimeout);
        registrationFormAutoCloseTimeout = null;
    }

    // Hide loading state when closing form
    hideRegistrationLoading();

    // Destroy Select2 instances when closing
    if (typeof $ !== 'undefined' && $.fn.select2) {
        const nationalitySelect = $('#reg-nationality');
        const countrySelect = $('#reg-country-of-residence');

        if (nationalitySelect.length && nationalitySelect.data('select2')) {
            nationalitySelect.select2('destroy');
        }
        if (countrySelect.length && countrySelect.data('select2')) {
            countrySelect.select2('destroy');
        }
    }

    // Destroy intl-tel-input instance when closing
    if (iti) {
        try {
            iti.destroy();
        } catch (e) {
            console.warn('Error destroying iti instance:', e);
        }
        iti = null;
    }

    sendToFlutter({
        type: 'closeRegistrationForm',
        timestamp: new Date().toISOString()
    });
}

// Disable browser autocomplete/autocorrect for registration form fields
function disableRegistrationAutocomplete() {
    const form = document.getElementById('registrationFormElement');
    if (!form) return;
    form.setAttribute('autocomplete', 'off');
    const fields = form.querySelectorAll('input, select');
    fields.forEach(field => {
        field.setAttribute('autocomplete', 'off');
        field.setAttribute('autocorrect', 'off');
        field.setAttribute('autocapitalize', 'off');
        field.setAttribute('spellcheck', 'false');
    });
}

// Clear all registration fields and reset UI state
function clearRegistrationFormFields() {
    const form = document.getElementById('registrationFormElement');
    if (!form) return;

    // Reset native form fields
    form.reset();

    // Clear text inputs explicitly (covers cases where reset isn't enough)
    ['reg-firstname', 'reg-lastname', 'reg-email', 'reg-company', 'reg-designation'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });

    // Clear phone input value
    const phoneInput = document.getElementById('reg-mobile');
    if (phoneInput) {
        phoneInput.value = '';
    }

    // Clear select values (with or without Select2)
    const nationalitySelect = document.getElementById('reg-nationality');
    if (nationalitySelect) {
        nationalitySelect.value = '';
        if (typeof $ !== 'undefined' && $.fn.select2 && $('#reg-nationality').data('select2')) {
            $('#reg-nationality').val('').trigger('change');
        }
    }
    const countrySelectEl = document.getElementById('reg-country-of-residence');
    if (countrySelectEl) {
        countrySelectEl.value = '';
        if (typeof $ !== 'undefined' && $.fn.select2 && $('#reg-country-of-residence').data('select2')) {
            $('#reg-country-of-residence').val('').trigger('change');
        }
    }

    // Reset badge preview placeholders
    const badgeFullname = document.getElementById('badge-fullname');
    if (badgeFullname) badgeFullname.textContent = 'FULL NAME';
    const badgeJobtitle = document.getElementById('badge-jobtitle');
    if (badgeJobtitle) badgeJobtitle.textContent = 'JOB TITLE';
    const badgeCompany = document.getElementById('badge-company');
    if (badgeCompany) badgeCompany.textContent = 'COMPANY NAME';
    const badgeCountry = document.getElementById('badge-country');
    if (badgeCountry) badgeCountry.textContent = 'COUNTRY OF RESIDENCE';
}

function showRegistrationLoading() {
    const loadingOverlay = document.getElementById('registrationLoadingOverlay');
    const submitBtn = document.getElementById('registration-submit-btn');

    if (loadingOverlay) {
        loadingOverlay.classList.add('visible');
    }

    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }
}

function hideRegistrationLoading() {
    const loadingOverlay = document.getElementById('registrationLoadingOverlay');
    const submitBtn = document.getElementById('registration-submit-btn');

    // Clear auto-close timeout if it exists
    if (registrationFormAutoCloseTimeout) {
        clearTimeout(registrationFormAutoCloseTimeout);
        registrationFormAutoCloseTimeout = null;
    }

    if (loadingOverlay) {
        loadingOverlay.classList.remove('visible');
    }

    if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register & Print';
    }
}

function handleRegistrationSubmit(event) {
    event.preventDefault();
    console.log('📝 Registration form submitted');

    // Clear previous errors
    clearErrors();
    // Show loading state
    showRegistrationLoading();

    // Get form data
    const formData = new FormData(event.target);

    // Get phone number from intl-tel-input if available
    let mobile = '';
    if (iti) {
        try {
            const phoneNumber = iti.getNumber();
            if (phoneNumber) {
                mobile = phoneNumber;
            } else {
                // Fallback to form data
                const phoneNumberInput = formData.get('mobile') || '';
                const countryCode = iti.getSelectedCountryData().dialCode || '971';
                mobile = phoneNumberInput ? `+${countryCode}${phoneNumberInput}` : '';
            }
        } catch (e) {
            console.warn('Error getting phone number from iti:', e);
            // Fallback to form data
            const phoneNumber = formData.get('mobile') || '';
            const countryCode = formData.get('country_code') || '+971';
            mobile = phoneNumber ? `${countryCode}${phoneNumber}` : '';
        }
    } else {
        // Fallback if iti is not initialized
        const phoneNumber = formData.get('mobile') || '';
        const countryCode = formData.get('country_code') || '+971';
        mobile = phoneNumber ? `${countryCode}${phoneNumber}` : '';
    }

    const registrationData = {
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        email: formData.get('email'),
        mobile: mobile,
        company_name: formData.get('company'),
        designation: formData.get('designation'),
        nationality: formData.get('nationality'),
        country_of_residence: formData.get('country_of_residence'),
        country: formData.get('nationality'),
        country_code: "IN",
        nationality_code: "IN",
        country_of_residence_code: "IN",
        ticket: 42,
        // ticket: 29,
    };

    console.log('📋 Registration data:', registrationData);

    // Send to Flutter
    sendToFlutter({
        type: 'registrationSubmit',
        data: registrationData,
        timestamp: new Date().toISOString()
    });

    // Auto-close form after 10 seconds if no errors occur
    // Clear any existing timeout first
    if (registrationFormAutoCloseTimeout) {
        clearTimeout(registrationFormAutoCloseTimeout);
    }

    registrationFormAutoCloseTimeout = setTimeout(() => {
        console.log('⏰ Auto-closing registration form after 10 seconds');
        closeRegistrationForm();
        registrationFormAutoCloseTimeout = null;
    }, 10000);

    // Note: Loading will be hidden when form closes or errors are shown
    // closeRegistrationForm();

    // Optionally show success message or welcome message
    // showWelcome(registrationData);
}

// Field mapping from API field names to form field IDs
const registrationFieldMap = {
    'firstname': 'reg-firstname',
    'lastname': 'reg-lastname',
    'email': 'reg-email',
    'mobile': 'reg-mobile',
    'company_name': 'reg-company',
    'company': 'reg-company', // Also support 'company' directly
    'designation': 'reg-designation',
    'nationality': 'reg-nationality',
    'ticket': 'reg-ticket',
    'country_of_residence': 'reg-country-of-residence'
};

// Function to show validation errors
function showError(errorData) {
    console.log('❌ Showing registration errors:', errorData);

    // Hide loading state when showing errors
    hideRegistrationLoading();

    // Clear previous errors first
    clearErrors();

    // Handle error structure: { detail: { field: [error messages] } }
    let errors = null;
    if (errorData && errorData.detail) {
        errors = errorData.detail;
    } else if (errorData && typeof errorData === 'object') {
        errors = errorData;
    }

    if (!errors) {
        console.warn('⚠️ Invalid error format');
        return;
    }

    // Iterate through each error field
    Object.keys(errors).forEach(fieldName => {
        const fieldId = registrationFieldMap[fieldName];

        // Skip if field doesn't exist in form
        if (!fieldId) {
            console.warn(`⚠️ Field "${fieldName}" not found in form`);
            return;
        }

        const fieldElement = document.getElementById(fieldId);
        if (!fieldElement) {
            console.warn(`⚠️ Element with ID "${fieldId}" not found`);
            return;
        }

        // Get error messages (could be array or single string)
        const errorMessages = Array.isArray(errors[fieldName])
            ? errors[fieldName]
            : [errors[fieldName]];

        // Display first error message
        const errorMessage = errorMessages[0];

        // Add error class to input/select
        fieldElement.classList.add('error');

        // If it's a mobile field error, also highlight the country code selector
        if (fieldId === 'reg-mobile') {
            const countryCodeSelect = document.getElementById('reg-country-code');
            if (countryCodeSelect) {
                countryCodeSelect.classList.add('error');
            }
        }

        // Find the parent registration-field div
        const fieldContainer = fieldElement.closest('.registration-field');
        if (fieldContainer) {
            // Remove existing error message if any
            const existingError = fieldContainer.querySelector('.registration-field-error');
            if (existingError) {
                existingError.remove();
            }

            // Create and append error message
            const errorElement = document.createElement('span');
            errorElement.className = 'registration-field-error';
            errorElement.textContent = errorMessage;
            fieldContainer.appendChild(errorElement);
        }
    });
}

// Function to clear all validation errors
function clearErrors() {
    // Remove error class from all fields (including country code select)
    const errorFields = document.querySelectorAll('.registration-field input.error, .registration-field select.error, .phone-input-container select.error, .phone-input-container input.error');
    errorFields.forEach(field => {
        field.classList.remove('error');
    });

    // Remove all error messages
    const errorMessages = document.querySelectorAll('.registration-field-error');
    errorMessages.forEach(error => {
        error.remove();
    });
}

// Customer details data
let customerData = null;
let isCustomerDetailsVisible = false;

function toggleCustomerDetails(data) {

    const detailsPanel = document.getElementById('customerDetailsPanel');

    // If data is provided, use it
    if (data !== undefined && data !== null) {
        // Store customer data
        customerData = data;
        isCustomerDetailsVisible = true;

        // Populate the fields with customer data
        updateCustomerDetailsDisplay(data);

        // Show the panel
        if (detailsPanel) {
            detailsPanel.classList.remove('hidden');
            console.log('👁️ Customer details visible with data:', data);
        }
    } else if (data === null) {
        // Hide the panel
        isCustomerDetailsVisible = false;
        customerData = null;
        if (detailsPanel) {
            detailsPanel.classList.add('hidden');
            console.log('🙈 Customer details hidden');
        }
    }

    sendToFlutter({
        type: 'toggleCustomerDetails',
        value: isCustomerDetailsVisible,
        data: customerData,
        timestamp: new Date().toISOString(),
    });
}

function updateCustomerDetailsDisplay(data) {
    // Update each field with the customer data from Flutter model
    updateField('customer-field-firstname', data.firstname || '');
    updateField('customer-field-lastname', data.lastname || '');
    updateField('customer-field-email', data.email || '');
    updateField('customer-field-phone', data.mobile || '');
    updateField('customer-field-company', data.company || '');
    updateField('customer-field-job', data.designation || '');
    updateField('customer-field-nationality', data.nationality || '');
    // Ticket info (ticket object with nested properties)
    const ticketInfo = data.ticket ? (data.ticket.ticket_display_name || data.ticket.name || '') : '';
    updateField('customer-field-ticket', ticketInfo);
}

function updateField(id, value) {
    const field = document.getElementById(id);
    if (field) {
        field.textContent = value;
    }
}

// Function called from Flutter to update user details form
function updateUserDetailsForm(userData) {

    sendToFlutter({
        type: 'log',
        timestamp: new Date().toISOString()
    });

    if (userData && Object.keys(userData).length > 0) {
        // Show and populate customer details
        toggleCustomerDetails(userData);
    } else {
        // Hide customer details if no data
        toggleCustomerDetails(null);
    }
}

// Clear field error when user starts typing
function setupFieldErrorClearing() {
    const registrationForm = document.getElementById('registrationFormElement');
    if (registrationForm) {
        const fields = registrationForm.querySelectorAll('input, select');
        fields.forEach(field => {
            // Handle input events for text fields
            field.addEventListener('input', function () {
                // Clear error for this specific field
                this.classList.remove('error');
                const fieldContainer = this.closest('.registration-field');
                if (fieldContainer) {
                    const errorElement = fieldContainer.querySelector('.registration-field-error');
                    if (errorElement) {
                        errorElement.remove();
                    }
                }
            });

            // Handle change events for select dropdowns
            if (field.tagName === 'SELECT') {
                field.addEventListener('change', function () {
                    // Clear error for this specific field
                    this.classList.remove('error');
                    const fieldContainer = this.closest('.registration-field');
                    if (fieldContainer) {
                        const errorElement = fieldContainer.querySelector('.registration-field-error');
                        if (errorElement) {
                            errorElement.remove();
                        }
                    }
                });
            }
        });

        // Setup phone number field to only accept numbers
        const phoneNumberField = document.getElementById('reg-mobile');
        if (phoneNumberField) {
            phoneNumberField.addEventListener('input', function (e) {
                // Remove any non-numeric characters
                this.value = this.value.replace(/[^0-9]/g, '');
            });

            phoneNumberField.addEventListener('paste', function (e) {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text');
                const numbersOnly = paste.replace(/[^0-9]/g, '');
                this.value = numbersOnly;
            });
        }
    }
}

// Notify Flutter that page is loaded
window.addEventListener('load', function () {
    console.log('✅ Event Check-In page loaded');

    // Setup field error clearing on input
    setupFieldErrorClearing();

    sendToFlutter({
        type: 'pageLoaded',
        timestamp: new Date().toISOString()
    });
});