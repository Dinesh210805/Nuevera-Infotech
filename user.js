let deleteTargetRow;

document.addEventListener('DOMContentLoaded', function() {
    const dbRequest = indexedDB.open('UserDatabase', 1);

    dbRequest.onupgradeneeded = function(event) {
        const db = event.target.result;
        const userStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
        userStore.createIndex('name', 'name', { unique: false });
        userStore.createIndex('gender', 'gender', { unique: false });
        userStore.createIndex('email', 'email', { unique: false });
        userStore.createIndex('phone', 'phone', { unique: false });
        userStore.createIndex('city', 'city', { unique: false });
    };

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;

        loadUsers(db);

        document.getElementById('addButton').addEventListener('click', function() {
            document.getElementById('popupForm').style.display = 'flex';
            document.getElementById('popupForm').classList.add('fade-in', 'slide-in');
        });

        document.getElementById('closePopup').addEventListener('click', function() {
            document.getElementById('popupForm').style.display = 'none';
        });

        document.getElementById('addUserForm').addEventListener('submit', function(event) {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const gender = document.getElementById('gender').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const city = document.getElementById('city').value;

            const transaction = db.transaction(['users'], 'readwrite');
            const userStore = transaction.objectStore('users');

            const user = { name, gender, email, phone, city };
            const request = userStore.add(user);

            request.onsuccess = function() {
                loadUsers(db);
                document.getElementById('addUserForm').reset();
                document.getElementById('popupForm').style.display = 'none';
            };
        });

        document.getElementById('closeViewPopup').addEventListener('click', function() {
            document.getElementById('viewPopup').style.display = 'none';
        });

        document.getElementById('cancelDelete').addEventListener('click', function() {
            document.getElementById('deletePopup').style.display = 'none';
        });

        document.getElementById('confirmDelete').addEventListener('click', function() {
            deleteUser(db);
            document.getElementById('deletePopup').style.display = 'none';
        });
    };

    dbRequest.onerror = function(event) {
        console.error('Error opening database:', event.target.errorCode);
    };
});

function loadUsers(db) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    const transaction = db.transaction(['users'], 'readonly');
    const userStore = transaction.objectStore('users');

    let index = 1; // Initialize index for serial number

    userStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;

        if (cursor) {
            const user = cursor.value;
            const newRow = document.createElement('tr');
            newRow.classList.add('user-row');
            newRow.innerHTML = `
                <td>${String(index).padStart(2, '0')}</td>
                <td>${user.name}</td>
                <td class="gender-cell">${user.gender}</td>
                <td>${user.city}</td>
                <td>${user.phone}</td>
                <td>
                    <span class="view-btn" onclick="viewUser(${cursor.key})"><img src="assets/view.png" alt="View"></span>
                    <span class="delete-btn" onclick="confirmDeleteUser(${cursor.key})"><img src="assets/delete.png" alt="Delete"></span>
                </td>
                <td style="display: none;">${user.email}</td>
            `;
            tableBody.appendChild(newRow);

            index++; // Increment index for next serial number
            cursor.continue();
        } else if (!tableBody.hasChildNodes()) {
            const noUsersRow = document.createElement('tr');
            noUsersRow.innerHTML = `<td colspan="6" class="no-users">No Users added</td>`;
            tableBody.appendChild(noUsersRow);
        }

        // Show gender column after adding the first user
        const genderCells = document.querySelectorAll('.gender-cell');
        genderCells.forEach(cell => {
            cell.style.display = 'table-cell';
        });

        // Show gender header in thead
        const genderHeader = document.querySelector('.gender-header');
        if (genderHeader) {
            genderHeader.style.display = 'table-cell';
        }
    };
}

function viewUser(id) {
    const dbRequest = indexedDB.open('UserDatabase', 1);

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['users'], 'readonly');
        const userStore = transaction.objectStore('users');
        const request = userStore.get(id);

        request.onsuccess = function(event) {
            const user = event.target.result;

            document.getElementById('viewName').textContent = user.name;
            document.getElementById('viewGender').textContent = user.gender;
            document.getElementById('viewEmail').textContent = user.email;
            document.getElementById('viewPhone').textContent = user.phone;
            document.getElementById('viewCity').textContent = user.city;

            document.getElementById('viewPopup').style.display = 'flex';
        };
    };
}

function confirmDeleteUser(id) {
    deleteTargetRow = id;
    const dbRequest = indexedDB.open('UserDatabase', 1);

    dbRequest.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['users'], 'readonly');
        const userStore = transaction.objectStore('users');
        const request = userStore.get(id);

        request.onsuccess = function(event) {
            const user = event.target.result;
            const userName = user.name;
            document.getElementById('deleteUserName').textContent = userName;
            document.getElementById('deletePopup').style.display = 'flex';
        };
    };
}

function deleteUser(db) {
    const transaction = db.transaction(['users'], 'readwrite');
    const userStore = transaction.objectStore('users');
    const request = userStore.delete(deleteTargetRow);

    request.onsuccess = function() {
        deleteTargetRow = null;
        reloadUsers(db);
    };
}

function reloadUsers(db) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    const transaction = db.transaction(['users'], 'readonly');
    const userStore = transaction.objectStore('users');

    let index = 1; // Initialize index for serial number

    userStore.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;

        if (cursor) {
            const user = cursor.value;
            const newRow = document.createElement('tr');
            newRow.classList.add('user-row');
            newRow.innerHTML = `
                <td>${String(index).padStart(2, '0')}</td>
                <td>${user.name}</td>
                <td class="gender-cell">${user.gender}</td>
                <td>${user.city}</td>
                <td>${user.phone}</td>
                <td>
                    <span class="view-btn" onclick="viewUser(${cursor.key})"><img src="assets/view.png" alt="View"></span>
                    <span class="delete-btn" onclick="confirmDeleteUser(${cursor.key})"><img src="assets/delete.png" alt="Delete"></span>
                </td>
                <td style="display: none;">${user.email}</td>
            `;
            tableBody.appendChild(newRow);

            index++; // Increment index for next serial number
            cursor.continue();
        } else if (!tableBody.hasChildNodes()) {
            const noUsersRow = document.createElement('tr');
            noUsersRow.innerHTML = `<td colspan="6" class="no-users">No Users added</td>`;
            tableBody.appendChild(noUsersRow);
        }

        // Show gender column after adding the first user
        const genderCells = document.querySelectorAll('.gender-cell');
        genderCells.forEach(cell => {
            cell.style.display = 'table-cell';
        });

        // Show gender header in thead
        const genderHeader = document.querySelector('.gender-header');
        if (genderHeader) {
            genderHeader.style.display = 'table-cell';
        }
    };
}
